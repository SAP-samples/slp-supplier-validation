const doSaveSupplierUsersData = (entity) => {
  try {
    // await wait(2000);
    return UPSERT.into(
      "com.sap.pgp.dev.SupplierControlApp.SupplierOrganization2Users"
    ).entries({
      ExternalOrganizationID: `${entity.ExternalOrganizationID}`,
      OrganizationName: `${entity.OrganizationName || ""}`,
      IsManaged: `${entity.IsManaged || ""}`,
      IsSupplier: `${entity.IsSupplier || ""}`,
      OrganizationTaxID: `${entity.OrganizationTaxID || ""}`,
      OrganizationStateTIN: `${entity.OrganizationStateTIN || ""}`,
      OrganizationRegionalTIN: `${entity.OrganizationRegionalTIN || ""}`,
      IsCustomer: `${entity.IsCustomer || ""}`,
      OrganizationVatID: `${entity.OrganizationVatID || ""}`,
      ExternalParentOrganizationID: `${
        entity.ExternalParentOrganizationID || ""
      }`,
      IsOrgApproved: `${entity.IsOrgApproved || ""}`,
      CorporatePhone: `${entity.CorporatePhone || ""}`,
      CorporateFax: `${entity.CorporateFax || ""}`,
      CorporateEmailAddress: `${entity.CorporateEmailAddress || ""}`,
      CompanyURL: `${entity.CompanyURL || ""}`,
      Address: `${entity.Address || ""}`,
      City: `${entity.City || ""}`,
      State: `${entity.State || ""}`,
      ZipCode: `${entity.ZipCode || ""}`,
      Country: `${entity.Country || ""}`,
      OrganizationType: `${entity.OrganizationType || ""}`,
      AddressName: `${entity.AddressName || ""}`,
      LoginID: `${entity.LoginID}`,
      FullName: `${entity.FullName || ""}`,
      EmailAddress: `${entity.EmailAddress || ""}`,
      Phone: `${entity.Phone || ""}`,
      IsUserApproved: `${entity.IsUserApproved || ""}`,
      DefaultCurrency: `${entity.DefaultCurrency || ""}`,
      TimeZoneID: `${entity.TimeZoneID || ""}`,
      PreferredLocale: `${entity.PreferredLocale || ""}`,
      IsEmailInviteNeeded: `${entity.IsEmailInviteNeeded || ""}`,
    });
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

module.exports = {
  doSaveSupplierUsersData,
};
