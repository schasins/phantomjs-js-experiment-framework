import csv, commands, sys

out_file = sys.argv[1]
f = open(out_file,'r')

l = len("Unable to access network")

def newline(s):
  pos = s.find("Unable to access network")
  if pos == -1:
    print s
  else:
    print s[:pos+l]
    newline(s[pos+l:])

for line in f:
  line = line.strip('\n')
  newline(line)
