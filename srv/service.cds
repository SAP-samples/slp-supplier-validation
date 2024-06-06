using {com.sap.pgp.dev.SupplierControlApp as my} from '../db/schema';
using {
    managed,
    sap
} from '@sap/cds/common';

service SourcingService @(path: '/sourcing') {
    entity SupplierRequest  as projection on my.SupplierRequest;
    entity ValidationControls  as projection on my.ValidationControls;
    entity NumberRange as projection on my.NumberRange;
    entity SRStatus as projection on my.SRStatus;
    entity SRegExternalIDs  as projection on my.SRegExternalIDs;

    action   doGetCategoriesData(realm : String)                                                        returns String;
    action   doGetSupplierData(realm : String, Category : String, Region : String)                      returns String;
    action   doGetSupplierDetailData(realm : String, SMID : String, Region : String, Category : String) returns String;
    action   doGetSupplierDetailDataFromLocalDB(ACMID : String, Region : String, Category : String)     returns String;
    action   doGetUserInformation(type : String)                                                        returns String;
    action   doCreateSupplier(supplierData : String)                                                    returns String;
    action   doSupplierNameCheck(SupplierName : String)                                                 returns String;
    action   dogetAccessToken()                                                                         returns String;
    action   doCreateEnvelope(SRID:String,TemplateID:String)                                            returns String;
    action   doGetEnvelopeStatuses()                                                                    returns String;
    action   ProcessPendingValidations()                                                                returns String;
    action   getNextNumber(requesttype:String)                                                          returns String;
    action   getSRInfo(requesttype:String)                                                              returns String;
    action   getSRStatus(requesttype:String , SRID:String)                                              returns String;
    action   doSupplierNameCheckAriba(SupplierName:String)                                              returns String;
    action   CreateSupplierInAriba(SRID:String,ACMID:String)                                            returns String;
    action   CreateSupplierUserInAriba(ACMID:String,EmailAddress:String,ContactName:String,Phone:String)                                                     returns String;
    action   doTriggerAfterApproval(SRID:String,ApprovalStatus:String)                                  returns String;
    action   doReceiveWorkflowUpdate(SRID:String)                                                       returns String;
    action   doReceiveWorkflowApprUpdate(SRID:String,ApprovalStatus:String)                                 ;
    action   doReceiveWorkflowRejUpdate(SRID:String,ApprovalStatus:String)                                  ;
    action   doUpdateStatus(requesttype:String , SRID:String, Status:String)                            returns String;
    action   doSupplierAddressCheck(Street:String,City:String, State: String, zipCode:String)           returns String;
    action   doInitiateWorkflow(SRID:String)                                                            returns String;
    action   ValidateTIN(TINID:String,TINName:String,CheckType:String)                                                   returns String;
    function doGetSessionTime()                                                                         returns String;

   
   
}
