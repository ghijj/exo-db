# Lambda Function Deployment

First, update functions in their respective directories and make sure package.json is updated

Update template.yaml to account for all functions and their properties

Run `sam build` and then  `sam package     --output-template-file packaged.yaml     --s3-bucket exodblambdafunctions` to package.

To deploy, run `sam deploy     --template-file packaged.yaml     --stack-name exodb-lambda-stack      --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM     --region us-east-1`

Websocket API URL: `wss://aarnwsrtbl.execute-api.us-east-1.amazonaws.com/dev/`