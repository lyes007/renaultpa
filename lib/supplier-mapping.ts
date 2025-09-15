// Supplier name mapping for logo files
export const SUPPLIER_LOGO_MAPPING: Record<string, string> = {
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
  'KARHABTKTN': 'karhabtktn_logo.jpg'
}

export function getSupplierLogoFilename(supplierName: string): string {
  const normalizedName = supplierName.toUpperCase().trim()
  
  // Check direct mapping first
  if (SUPPLIER_LOGO_MAPPING[normalizedName]) {
    return SUPPLIER_LOGO_MAPPING[normalizedName]
  }
  
  // Try to find partial matches
  for (const [key, filename] of Object.entries(SUPPLIER_LOGO_MAPPING)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return filename
    }
  }
  
  // Fallback: clean the name and try common extensions
  const cleanName = normalizedName
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
  
  return `${cleanName}.jpg`
}
