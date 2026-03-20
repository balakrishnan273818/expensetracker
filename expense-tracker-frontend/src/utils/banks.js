import axisLogo from "../assets/banks/axis.png";
import hdfcLogo from "../assets/banks/hdfc.png";
import idfcLogo from "../assets/banks/idfc.png";

export const BANKS = {
    axis: {
        key: "axis",
        label: "Axis",
        logo: axisLogo
    },
    hdfc: {
        key: "hdfc",
        label: "HDFC",
        logo: hdfcLogo
    },
    idfc: {
        key: "idfc",
        label: "IDFC",
        logo: idfcLogo
    }
};

// ✅ Get label
export function getBankLabel(bankKey) {
    return BANKS[bankKey]?.label || bankKey;
}

// ✅ Get logo (THIS WAS MISSING)
export function getBankLogo(bankKey) {
    return BANKS[bankKey]?.logo || null;
}

// ✅ For iteration in UI
export const BANK_LIST = Object.values(BANKS);