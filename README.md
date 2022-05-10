# scribblenotes

Steps to run application:

1) Run 'npm i'.
2) Create a new database and run the sql script located in this root directory.
3) Create a file named '.env' in the root directory and copy everything from '.env.example', adding your own values
4) Run 'npm run dev'

To get payment working in a development environment:
1) Log into your stripe account, and copy the publishable key and secret key into the .env file
2) From the stripe command line interface, run 'stripe listen --forward-to localhost:3000/payment/webhook'
3) Another secret key should be outputted in the terminal, copy this into the .env file
