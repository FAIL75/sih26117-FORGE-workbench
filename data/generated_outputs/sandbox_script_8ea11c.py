from parser import parse_key_findings
key_findings_summary = parse_key_findings('The image shows a computer screen displaying the Google search bar. The search bar is located in the center of the screen, and the Google logo is prominently displayed at the top. The background of the screen is a dark purple color.')
write_file(filename='key_findings_summary.txt', content=key_findings_summary)