#!/usr/bin/python
# server
#    python server.py
# browser
#    https://localhost:4443
#    https://localhost:8000

import http.server
##import ssl
port = 8000
host = 'localhost'
server_address = ('0.0.0.0', port)

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_response_only(self, code, message=None):
        super().send_response_only(code, message)
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')

httpd = http.server.HTTPServer(server_address, NoCacheHTTPRequestHandler)
"""
httpd.socket = ssl.wrap_socket(
    httpd.socket,
    server_side=True,
    certfile='webserver/localhost.crt',
    keyfile='webserver/localhost.key')
"""
print(f"Server running on http://{host}:{port}")
try: httpd.serve_forever()
except: 0
