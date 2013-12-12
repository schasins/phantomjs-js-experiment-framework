import csv, commands, sys

out_file = sys.argv[1]
f = csv.reader(open("resources/input.csv", 'rb'), delimiter=';')
for row in f:
  url = row[0]
  command = "grep \"" + url + "\" " + out_file
  #print command
  status, output = commands.getstatusoutput(command)
  if not output == "" and output.find("not found") == -1:
    lines = output.split("\n")
    l = len(lines)
    print_line = False
    for line in lines:
      if line.find("Unable to access network") == -1 and line.find("timeout") == -1:
        print_line = line
        break;

    if not print_line:
      for line in lines:
        if line.find("Unable to access network") == -1:
          print_line = line
          break;
    
    if not print_line:
      print_line = lines[0]
    print print_line
    
  else:
    print url, " - lost"

# status, output = commands.getstatusoutput("grep \"google.com\" output-split1.csv")
# print output
