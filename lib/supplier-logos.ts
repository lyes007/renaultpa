// Utility for handling supplier logos and name variations

interface SupplierLogoInfo {
  logoPath: string | null
  displayName: string
}

// Map API supplier names to logo file names
const supplierLogoMap: Record<string, string> = {
  'LIQUI MOLY': 'LIQUI_MOLY.jpg',
  'FEBI BILSTEIN': 'FEBI_BILSTEIN.jpg',
  'VICTOR REINZ': 'VICTOR_REINZ.jpg',
  'MEAT & DORIA': 'MEAT & DORIA.jpg',
  'MCB BEARINGS': 'MCB_BEARINGS.jpg',
  'BOSCH': 'BOSCH.jpg',
  'VALEO': 'VALEO.jpg',
  'TRW': 'TRW.jpg',
  'SACHS': 'SACHS.jpg',
  'MONROE': 'MONROE.jpg',
  'MOOG': 'MOOG.jpg',
  'GATES': 'GATES.jpg',
  'SKF': 'SKF.jpg',
  'NSK': 'NSK.jpg',
  'NPR': 'NPR.jpg',
  'NRF': 'NRF.jpg',
  'NGK': 'NGK.jpg',
  'CHAMPION': 'CHAMPION.jpg',
  'BGF': 'BGF.jpg',
  'WUNDER': 'WUNDER.jpg',
  'VIKA': 'VIKA.jpg',
  'SASIC': 'SASIC.jpg',
  'VAGMAX': 'VAGMAX.jpg',
  'CASTROL': 'CASTROL.jpg',
  'TRICLO': 'TRICLO.jpg',
  'MANDO': 'MANDO.jpg',
  'MOTUL': 'MOTUL.jpg',
  'KAVO': 'KAVO.jpg',
  'VARTA': 'VARTA.jpg',
  'FTE': 'FTE.jpg',
  '3RG': '3RG.jpg',
  'MISFAT': 'MISFAT.jpg',
  'ELF': 'ELF.jpg',
  'TOTAL': 'TOTAL.jpg',
  'LPR': 'LPR.jpg',
  'TOPRAN': 'TOPRAN.jpg',
  'VERNET': 'VERNET.jpg',
  'LUCAS': 'LUCAS.jpg',
  'YACCO': 'YACCO.jpg',
  'VIF': 'VIF.jpg',
  'UFI': 'UFI.jpg',
  'VM': 'VM.jpg',
  'TYC': 'TYC.jpg',
  'TEKNOROT': 'TEKNOROT.jpg',
  'SIAMM': 'SIAMM.jpg',
  'TALOSA': 'TALOSA.jpg',
  'STC': 'STC.jpg',
  'SVAC': 'SVAC.jpg',
  'SNR': 'SNR.jpg',
  'SIDAT': 'SIDAT.jpg',
  'RTS': 'RTS.jpg',
  'RODRUNNER': 'RODRUNNER.jpg',
  'RIDEX': 'RIDEX.jpg',
  'RECORD': 'RECORD.jpg',
  'PSA': 'PSA.jpg',
  'PLEKSAN': 'PLEKSAN.jpg',
  'PRO MAX': 'PRO_MAX.jpg',
  'PRASCO': 'PRASCO.jpg',
  'PIERBURG': 'PIERBURG.jpg',
  'OPTIMAL': 'OPTIMAL.jpg',
  'PHILIPS': 'PHILIPS.jpg',
  'OCEANA': 'OCEANA.jpg',
  'OSSCA': 'OSSCA.jpg',
  'MS GERMANY': 'MS_GERMANY.jpg',
  'NARVA': 'NARVA.jpg',
  'MULTISPARK': 'MULTISPARK.jpg',
  'MOTRIO': 'MOTRIO.jpg',
  'METELLI': 'METELLI.jpg',
  'MECARM': 'MECARM.jpg',
  'METALCAUCHO': 'METALCAUCHO.jpg',
  'MECAFILTER': 'MECAFILTER.jpg',
  'MAYSAN MANDO': 'Maysan_mando.jpg',
  'MCAR': 'MCAR.jpg',
  'MARS': 'MARS.jpg',
  'MASTER': 'MASTER.jpg',
  'MARILIA': 'MARILIA.jpg',
  'MALO': 'MALO.jpg',
  'SARDES FILTRE': 'SARDES_FILTRE.jpg',
  'FRAP': 'FRAP.jpg',
  'UCEL': 'UCEL.jpg',
  'GIF': 'GIF.jpg',
  'ISAM': 'ISAM.jpg',
  'MTA': 'MTA.jpg',
  'RUVILLE': 'RUVILLE.jpg',
  'ZEN': 'ZEN.jpg',
  'KLAS': 'KLAS.jpg',
  'FACET': 'FACET.jpg',
  'AUTOGAMMA': 'AUTOGAMMA.jpg',
  'SONAX': 'sonax.jpg',
  'EXO': 'EXO.jpg',
  'SHELL': 'SHELL.jpg',
  'OCAP GROUPE': 'OCAP_GROUPE.jpg',
  'DRIVE': 'drive.jpg',
  'MFILTRE': 'MFILTRE.jpg',
  'SELENIA': 'SELENIA.jpg',
  'GM': 'GM.jpg',
  'NE': 'NE.jpg',
  'FILTRON': 'filtron.jpg',
  'KARHABTKTN': 'karhabtktn_logo.jpg',
  'ROC': 'BOSCH.jpg' // Fallback to BOSCH logo for ROC
}

// Normalize supplier name for logo lookup
function normalizeSupplierName(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_') // Replace non-alphanumeric with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

// Try to find a close match for supplier names
function findCloseMatch(supplierName: string): string | null {
  const normalized = normalizeSupplierName(supplierName)
  
  // Try exact match first
  if (supplierLogoMap[supplierName]) {
    return supplierLogoMap[supplierName]
  }
  
  // Try normalized match
  const logoFileName = `${normalized}.jpg`
  
  // Check if this normalized name exists in our mapping
  for (const [key, value] of Object.entries(supplierLogoMap)) {
    if (normalizeSupplierName(key) === normalized) {
      return value
    }
  }
  
  return null
}

// Get supplier logo info
export function getSupplierLogoInfo(supplierName: string): SupplierLogoInfo {
  // Try to find a close match first
  const matchedLogo = findCloseMatch(supplierName)
  if (matchedLogo) {
    return {
      logoPath: `/suppliers/${matchedLogo}`,
      displayName: supplierName
    }
  }

  // Try normalized name as fallback
  const normalizedName = normalizeSupplierName(supplierName)
  const logoFileName = `${normalizedName}.jpg`
  
  return {
    logoPath: `/suppliers/${logoFileName}`,
    displayName: supplierName
  }
}

// Check if a supplier logo exists (for preloading or validation)
export async function checkSupplierLogoExists(logoPath: string): Promise<boolean> {
  try {
    const response = await fetch(logoPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Get all available supplier logos (for debugging or preloading)
export function getAllSupplierLogos(): string[] {
  return Object.values(supplierLogoMap).map(fileName => `/suppliers/${fileName}`)
}
