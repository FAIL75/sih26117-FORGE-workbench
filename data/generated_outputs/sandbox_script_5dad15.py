from parser import parse_key_findings
key_findings_summary = parse_key_findings(key_findings_content)
write_file(filename='key_findings_summary.txt', content=key_findings_summary)