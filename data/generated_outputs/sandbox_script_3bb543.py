from parser import parse_key_findings
key_findings_summary = parse_key_findings('The image shows a computer screen displaying the Google search bar. The search bar is currently empty, with no search terms entered. The background of the image is a light brown color, and the rest of the image is a dark brown color.')
write_file(filename='key_findings_summary.txt', content=key_findings_summary)