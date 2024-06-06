using {com.sap.pgp.dev.SupplierControlApp as my} from '../db/masterdata';
using {
    managed,
    sap,
} from '@sap/cds/common';

service AdminService @(path: '/admin') {
    entity Categories                 as projection on my.Categories;
    entity Suppliers                  as projection on my.Suppliers;
    entity Regions                    as projection on my.Regions;
    entity SiteControlParams          as projection on my.SiteControlParams;
    entity SupplierOrganization2Users as projection on my.SupplierOrganization2Users;
    entity EventLogs                  as projection on my.EventLogs;
      
   
    action Org2UserMapping(entities : array of SupplierOrganization2Users)            returns String;
    action DoLoadCategories(entities : array of Categories)                           returns String;
    action DoLoadSuppliers(entities : array of Suppliers)                             returns String;
    action DoLoadRegions(entities : array of Regions)                                 returns String;
    action doDeleteCategories(entities : array of Categories)                         returns String;
    action DoPullSuppliersFromAriba(realm : String)                                   returns String;
    action DoPullSupplierUserFromAriba(realm : String)                                returns String;
    action DoLoadSupplierUsers(entities : array of SupplierOrganization2Users)        returns String;
    action DownloadSampleCSVFile(fileName : String)                                   returns String;
    
    
}
