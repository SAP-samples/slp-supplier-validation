using {
    managed,
    sap,
    cuid
} from '@sap/cds/common';

namespace com.sap.pgp.dev.SupplierControlApp;

entity NumberRange : managed {
    key Type : String;
    CurrentNumber : Integer;
}

entity ValidationControls : managed {
    key Realm                     : String;
        SRaddrcheck               : Boolean;
        SRdupariba                : Boolean;
        SRDuplicateERP            : Boolean;
        SRDandB                   : Boolean;
        SRDocuSign                : Boolean;
        SRGaddrcheck              : Boolean;
        SRGAddrinput              : String;
        SRGgdupariba              : Boolean;
        SRGduplicateerp           : Boolean;
        srgdandb                  : Boolean;
        srgdandbinput             : String;
        SRGdocusign               : Boolean;
        SRGofac                   : Boolean;
        SRGOFACinput              : String;
        SRGtin                    : Boolean;
        SRGtininput               : String;
        SRGein                    : Boolean;
        SRGeininput               : String;
        SRGbankvalidation         : Boolean;
}

entity SRegExternalIDs : managed {
    key Realm                     : String;
        ValidationProcess         : String;
        ValidationDate            : String;
        IRSTin                    : String;
        Ofac                      : String;
        AddressValid              : String;
        DocuSign                  : String;
}

entity SupplierRequest : managed {
    key SuppRequestID           : String;
        SupplierName            : String;
        SDBAName                : String;
        SupplierStreet          : String;
        SupplierCity            : String;
        SupplierRegion          : String;
        SupplierPostalCode      : String;
        SupplierCountry         : String;
        PrimaryContactFirstName : String;
        PrimaryContactLastName  : String;
        PrimaryContactEMail     : String;
        PrimaryContactNo        : String;
        NDA                     : Boolean;
        DueDiligence            : Boolean;
        Comments                : String;
        Categories              : String;
        Regions                 : String;
}

entity SRSupplier : managed {
    key SuppRequestID           : String;
        SupplierACMID           : String;
        
}

entity Envelopes : managed {
    key EnvelopeID              : String;
        TemplateID              : String;
        SuppContactID           : String;
        SuppContactEmail        : String;
        Status                  : String;
}

entity DocuEnvelopes : managed {
    key SuppRequestID           : String;
        EnvelopeID              : String;
        TemplateID              : String;
        SuppContactID           : String;
        SuppContactEmail        : String;
        Status                  : String;
}

entity SRApproval : managed {
    key SuppRequestID           : String;
    key ApprovalID              : String;
        CurrentStepName         : String;
        NextStepName            : String;
        ApprovalStatus          : String;
}

entity SRStatus : managed {
    key Type                    : String;
    key SuppRequestID           : String;
        Status                  : String;
}