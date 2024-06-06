
const workflowtemplate = {
   "definitionId": "eu10-canary.integrated.suppliercontroltower1.supplierProcess",
   "context": {
      "recipient1": "1b290aad-eec9-4c80-8ba0-49c41f61d5c3",
      "sender1": "aribauser123@gmail.com",
      "supprequestid": "",
      "suppliername": "",
      "sdbaname": "",
      "supplierstreet": "",
      "suppliercity": "",
      "supplierregion": "",
      "supplierpostalcode": "",
      "suppliercountry": "",
      "comments": ""
  }
 };

 const paginationtemplate = {
	"answers": 
	[
	{
	"externalSystemCorrelationId": "KI_9735612", // Start Validation Process
	"answer": "True"
	},
	{
	"externalSystemCorrelationId": "KI_9735613", // Last Validation Date
	"answer": "12/30/2023"
	},
    {
	"externalSystemCorrelationId": "KI_9735615", // IRS Tin Name
	"answer": "TIN Validated against IRS. Its Valid"
	},
    {
	"externalSystemCorrelationId": "KI_9735616", // OFAC
	"answer": "OFAC Not Validated"
	},
    {
	"externalSystemCorrelationId": "KI_9735620", // Address Validation
	"answer": "Address Validated against USPS and is Valid"
	},
    {
	"externalSystemCorrelationId": "KI_15222806", // DocuSign
	"answer": "Docusign NDA Complete"
	}
	
]
 };

module.exports = Object.freeze({
   WORKFLOW_TEMPLATE: workflowtemplate,
   PUBLISHQA_TEMPLATE: paginationtemplate
});
