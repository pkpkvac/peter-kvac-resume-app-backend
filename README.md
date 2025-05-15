# Peter Kvac Resume Backend

Backend services for my resume website, including:

- Visitor counter API
- Infrastructure as code (Terraform)
- AWS Lambda functions

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Deploy infrastructure:

   ```
   cd terraform
   terraform init
   terraform apply
   ```

# Visitor Counter Lambda Function

This repository contains the backend code for the visitor counter feature of my resume website. The main component is an AWS Lambda function that tracks unique daily visitors and returns the total count.

## Architecture

- **AWS Lambda**: Serverless function that processes visitor requests
- **API Gateway**: HTTP endpoint that triggers the Lambda function
- **RDS MySQL**: Database to store visitor information
- **Terraform**: Infrastructure as code to manage AWS resources

## Lambda Function Overview

The Lambda function (`src/index.js`) handles visitor counting logic:

1. Extracts visitor information (IP, user agent) from the request
2. Checks if the visitor has been counted today
3. If not, adds a new record to the database
4. Returns the total unique visitor count with CORS headers

## Updating the Lambda Function

To update the Lambda function code:

1. Make changes to the code in `src/index.js`
2. Create a new deployment package:
   ```bash
   zip -r lambda_function.zip src/ node_modules/
   ```
3. Deploy the updated function using Terraform:
   ```bash
   cd terraform
   terraform apply -var="db_username=admin" -var="db_password=your_password"
   ```

## Testing the Lambda Function

You can test the Lambda function in the AWS Console:

1. Go to the Lambda service in AWS Console
2. Select the `visitor-counter` function
3. Create a test event with the following structure:
   ```json
   {
   	"requestContext": {
   		"identity": {
   			"sourceIp": "192.168.1.1"
   		}
   	},
   	"headers": {
   		"User-Agent": "test-agent"
   	}
   }
   ```
4. Run the test and check the execution results

## Environment Variables

The Lambda function uses the following environment variables:

- `DB_HOST`: RDS endpoint
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (visitorcounter)

## API Documentation

### Visitor Counter API

**Endpoint:**

api_url = "https://fgwvhyzjm6.execute-api.us-west-2.amazonaws.com/prod/visitors"
lambda_arn = "arn:aws:lambda:us-west-2:416536262341:function:visitor-counter"
rds_endpoint = "visitor-counter-db.cryy2ccg430o.us-west-2.rds.amazonaws.com:3306"

curl -X GET https://fgwvhyzjm6.execute-api.us-west-2.amazonaws.com/prod/visitors
