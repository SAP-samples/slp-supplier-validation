[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/slp-supplier-validation)](https://api.reuse.software/info/github.com/SAP-samples/slp-supplier-validation)

# Welcome to SLP Supplier Validation
Welcome to the sample use case of the Supplier Validation application. This open source application developed using the Cloud Application Programming Model (CAP) will help as reference for customers developing solution to validate Supplier Registration data in Ariba Supplier Lifecycle management with external thirdparty providers like IRS for Tax Identification validation, OFAC check, Address Validation etc.
This validation process help improve quality of supplier data and avoid creation of erroneous Supplier record in SAP Master Data Governance or ERP systems.

## Requirements
This solution utilizes BTP Services. Below are pre-requisite services for using this application. \
a. PostgreSQL on SAP BTP, hyperscaler \
b. SAP Application Logging Service for SAP BTP \
c. SAP Job Scheduling Service \
d. SAP BTP, Cloud Foundry Runtime

## Description
SAP Ariba offers a comprehensive solution to register suppliers and qualify them for downstream transaction It is important to validate Supplier Registration data and provide easy approach to create supplier request data and sync it with Ariba Supplier Master record. This application will help as a reference for customers who would like to perform extensive thirdparty validation.

Some of the key capabilities of SLP Validation Application includes 
1. Creation Supplier Request
2. Validation Controls for Supplier Request and Supplier Registration.
3. External Correlation ID maintance 
4. Supplier List from Ariba
5. Supplier Request Overview
Please note this sample application does not provide any service handlers to integrate to thirdparty applications. Customers have to develop the integration using their preferred provider and API provided. 

Sample View of SLP Supplier Validation

![Reference Image](/slpvalidation.jpg)

## Database Requirement
Use the main GIT branch if you are using PostgreSQL as your database in BTP. If the database is HANA DB, convert the database HDB and also update MTA.YAML to deploy Multi Target Applications with HANA Database.

## Deploy the Application
Prior to running the package and deploy.

Step1: Go to app directory and run `npm i` command.\
Step2: Run the same command `npm i` under root directory as well.\
Step3: Run the following command to build and deploy the file to the SAP BTP, Cloud Foundry environment.

```
npm run mta:package:deploy
```

## Known Issues
No known Issues

## How to Get Support
[Create an issue](https://github.com/SAP-samples/slp-supplier-validation/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, or offer fixes and improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.