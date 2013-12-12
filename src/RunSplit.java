import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import sun.misc.IOUtils;
import au.com.bytecode.opencsv.CSVReader;
import au.com.bytecode.opencsv.CSVWriter;

public class RunSplit {
	String inputFile;
	String javaScriptFile;
	String outputFile;
	List<String[]> rows;
	
	RunSplit(String inputFile, String javaScriptFile, String outputFile){
		this.inputFile = inputFile;
		this.javaScriptFile = javaScriptFile;
		this.outputFile = outputFile;
		
		List<String[]> rows = new ArrayList<String[]>();
		try {
			CSVReader reader = new CSVReader(new FileReader(inputFile));
		    rows = reader.readAll();
		}
		catch(Exception e){
			System.out.println("Failed to open input file.");
			return;
		}
		this.rows = rows;

	}
	
	public void execute(int threads){
		//since we'll be appending, let's clear it first
		try{
			PrintWriter output = new PrintWriter(outputFile + ".csv"); 
			output.println("url;title;start-up;load;execute"); 
			output.close();
		}
		catch(Exception e){
			System.out.println("Not able to clear output file.");
		}
		
		long start = System.currentTimeMillis();
		int jobs = rows.size();
		if (threads > jobs){
			threads = jobs;
		}
		int low = jobs/threads;
		int high = low+1;
		int threshold = jobs%threads;
		int rowCounter = 0;
		ArrayList<Thread> threadList = new ArrayList<Thread>();
		for (int i = 0; i < threads; i++){
			int jump = (i < threshold) ? high : low;
			RunTests r = new RunTests(this.inputFile,this.javaScriptFile, outputFile, rowCounter, rowCounter+jump, i);
			rowCounter += jump;
	        Thread t = new Thread(r);
	        threadList.add(t);
	        t.start();
		}	
		
		//barrier so the main thread won't end
		for (Thread thread : threadList) {
		    try {thread.join();} catch (InterruptedException e) {System.out.println("Could not join thread.");}
		}

		long stop = System.currentTimeMillis();
		
		try{
			PrintWriter output = new PrintWriter(new FileWriter(outputFile + ".csv", true));
			for (int i = 0; i < threads; i++){
				FileInputStream inputStream = new FileInputStream(outputFile + i + ".csv");
				BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"));
				String line;
				while(( line = br.readLine()) != null ) {
					//System.out.println(line);
					output.println(line);
				}
			}
			output.println("TOTAL;" + String.valueOf(stop-start)); 
			output.close();
		}
		catch(Exception e){
			System.out.println("Not able to clear output file.");
		}
	}
	
	private static class RunTests implements Runnable {
		String inputFile;
		String javaScriptFile;
		String outputFile;
		int start;
		int end;
		int id;
		
		RunTests(String inputFile, String javaScriptFile, String outputFile, int start, int end, int id){
			this.inputFile = inputFile;
			this.javaScriptFile = javaScriptFile;
			this.outputFile = outputFile;
			this.start = start;
			this.end = end;
			this.id = id;
		}
		
	    public void run() {
	    	try {
	    		System.out.println(Thread.currentThread().getId());
	    		Process tr = Runtime.getRuntime().exec( new String[]{ "phantomjs-1.9.2-linux-i686/bin/phantomjs", 
	    				"src/javascript_testing_parallel_split.js", inputFile, javaScriptFile, outputFile, 
	    				Integer.toString(start), Integer.toString(end), Integer.toString(id) } );
	    		
	    		//use this line if need to time the program
	    		//try{tr.waitFor();}catch(Exception e){System.out.println("Not able to wait for thread.");}
	    		
	    		
	    		//Print the subprograms' outputs
	    		InputStream inputStream = tr.getInputStream();
	    		InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
	    		BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

	    		String line;
	    		while ((line = bufferedReader.readLine()) != null)
	    		{
	    		    System.out.println(line);
	    		}
	    		
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	    }
	}
	
	public static void main(String[] args) {
		String inputFile = "resources/input.csv";
		String javaScriptFile = "resources/javaScript.js";
		
		String outputFile = "output-split4_";
		RunSplit runner = new RunSplit(inputFile,javaScriptFile,outputFile);
		runner.execute(8);
	}

}