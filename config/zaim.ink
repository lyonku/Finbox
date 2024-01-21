server {
    server_name zaim.ink;
    listen 80;

    client_max_body_size 10M;

    root /home/deploy/finbox.mobi/public;

	# Add index.php to the list if you are using PHP
	index index.html index.htm index.nginx-debian.html;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }


	location /assets/ {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri/ =404;
	}

	location /js/ {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri/ =404;
	}

    error_log  /var/log/nginx/zaim.ink-error.log;
    access_log /var/log/nginx/zaim.ink-access.log;
}
