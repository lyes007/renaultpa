// Model image utilities for matching model names to photo files

export interface ModelImageMapping {
  [key: string]: string
}

// Common model name variations and mappings
export const MODEL_IMAGE_MAPPINGS: Record<string, ModelImageMapping> = {
  'renault': {
    'CLIO': 'CLIO_II_BB__CB__199803_.jpeg',
    'CLIO II': 'CLIO_II_BB__CB__199803_.jpeg',
    'CLIO II CAMIONNETTE': 'CLIO_II_Camionnette_SB012__199809_.jpeg',
    'CLIO IV GRANDTOUR': 'CLIO_IV_Grandtour_KH__201301_.jpeg',
    'CLIO SYMBOL': 'CLIO_SYMBOL_I_LB__199802_.jpeg',
    'SCENIC': 'GRAND_SCNIC_II_JM01__200404_.jpeg',
    'GRAND SCENIC': 'GRAND_SCNIC_II_JM01__200404_.jpeg',
    'GRAND SCÉNIC': 'GRAND_SCNIC_II_JM01__200404_.jpeg',
    'GRAND SCÉNIC II': 'GRAND_SCNIC_II_JM01__200404_.jpeg',
    'GRAND SCÉNIC III': 'GRAND_SCNIC_III_JZ01__200902_.jpeg',
    'ESPACE': 'ESPACE_IV_JK01__200211_.jpeg',
    'ESPACE I': 'ESPACE_I_J11__198407_-_199212.jpeg',
    'ESPACE II': 'ESPACE_II_JS63__199101_-_199710.jpeg',
    'ESPACE IV': 'ESPACE_IV_JK01__200211_.jpeg',
    'AVANTIME': 'AVANTIME_DE0__200109_-_200305.jpeg',
    'MEGANE': '19_I_BC53__198801_-_199409.jpeg',
    'MÉGANE': '19_I_BC53__198801_-_199409.jpeg',
    '19': '19_I_BC53__198801_-_199409.jpeg',
    '19 I': '19_I_BC53__198801_-_199409.jpeg',
    '19 I CABRIOLET': '19_I_Cabriolet_D53__199107_-_199204.jpeg',
    '19 I CHAMADE': '19_I_Chamade_L53__198801_-_199212.jpeg',
    '21': '21_B48__198907_-_199406.jpeg',
    '21 BREAK': '21_Break_K48__198603_-_199707.jpeg',
    'KANGOO': '4_112__196204_-_199312.jpeg',
    '4': '4_112__196204_-_199312.jpeg',
    '4 CAMIONNETTE': '4_Camionnette_R21__R23__196609_-_199312.jpeg',
    '7': '7_124__197503_-_198212.jpeg',
    '10': '10_119__196605_-_197210.jpeg',
    '11': '11_BC37__198303_-_199509.jpeg',
    '12': '12_196910_-_198412.jpeg',
    '12 VARIABLE': '12_Variable_117__197008_-_198312.jpeg',
    '14': '14_121__197605_-_198312.jpeg',
    '15': '15_130__197109_-_198010.jpeg',
    '17': '17_197203_-_198010.jpeg'
  },
  'nissan': {
    'MICRA': 'MICRA_IV_K13__201005_.jpeg',
    'MICRA I': 'MICRA_I_K10_198212_-_199211.jpeg',
    'MICRA IV': 'MICRA_IV_K13__201005_.jpeg',
    'QASHQAI': 'QASHQAI_QASHQAI_2_I_J10_NJ10_JJ10E_200612_-_201404.jpeg',
    'QASHQAI+2': 'QASHQAI_QASHQAI_2_I_J10_NJ10_JJ10E_200612_-_201404.jpeg',
    'X-TRAIL': 'X-TRAIL_T30_200101_-_201312.jpeg',
    'NOTE': 'NOTE_E11_NE11_200501_-_201308.jpeg',
    'NOTE II': 'NOTE_E12_201209_.jpeg',
    'TIIDA': 'TIIDA_35_portes_C11_200405_-_201312.jpeg',
    'TIIDA 3 PORTES': 'TIIDA_35_portes_C12_201008_.jpeg',
    'TIIDA A TROIS VOLUMES': 'TIIDA_A_trois_volumes_SC11_200405_-_201312.jpeg',
    'PRIMERA': 'PRIMERA_P12_200201_.jpeg',
    'PRIMERA BREAK': 'PRIMERA_Break_WP12_200201_.jpeg',
    'PRIMERA TRAVELLER': 'PRIMERA_Traveller_W10_199007_-_199803.jpeg',
    'ALMERA': 'ALMERA_I_N15_199507_-_200009.jpeg',
    'ALMERA HATCHBACK': 'ALMERA_I_Hatchback_N15_199507_-_200101.jpeg',
    'MAXIMA': 'MAXIMA_VII_A35_200809_.jpeg',
    'MAXIMA III': 'MAXIMA_III_J30_198810_-_199502.jpeg',
    'PATHFINDER': 'PATHFINDER_II_R50_199509_-_200507.jpeg',
    'MURANO': 'MURANO_III_Z52__201410_.jpeg',
    'MURANO II': 'MURANO_II_Z51_200710_-_201409.jpeg',
    'NAVARA': 'NP300_NAVARA_D40_200410_.jpeg',
    'NP300 NAVARA': 'NP300_NAVARA_D40_200410_.jpeg',
    'NP300 PICKUP': 'NP300_PICKUP_D22_200804_.jpeg',
    'NV200': 'NV200_CamionnetteBreak_201002_.jpeg',
    'NV200 EVALIA': 'NV200_EVALIA_AutobusAutocar_201007_.jpeg',
    'NV300': 'NV300_Kombi_X82_201609_.jpeg',
    'NV400': 'NV400_Camion_plate-formeChssis_X62_X62B_201111_.jpeg',
    'PATROL': 'PATROL_GR_IV_Y60_GR_198601_-_199802.jpeg',
    'PATROL III': 'PATROL_III2_Station_Wagon_W260_198808_-_199804.jpeg',
    'PIXO': 'PIXO_UA0_200903_.jpeg',
    'LEAF': 'LEAF_ZE0_201011_.jpeg',
    'SENTRA': 'SENTRA_VII_B17_201208_.jpeg',
    'BLUEBIRD': 'BLUEBIRD_910_198001_-_198312.jpeg',
    'BLUEBIRD SYLPHY': 'BLUEBIRD_SYLPHY_SYLPHY_III_B17_201207_.jpeg',
    'SUNNY': 'SUNNY_III_Traveller_Y10_199011_-_200003.jpeg',
    'TERRANO': 'TERRANO_I_WD21_198607_-_199602.jpeg',
    'TERRANO II': 'TERRANO_II_R20_199210_-_200709.jpeg',
    'PICK UP': 'PICK_UP_D21_198509_-_200812.jpeg',
    'XTERRA': 'XTERRA_N50_200501_.jpeg',
    'ARMADA': 'ARMADA_TA60_200308_-_201512.jpeg',
    'KUBISTAR': 'KUBISTAR_Camionnette_X76_200308_.jpeg',
    'INTERSTAR': 'INTERSTAR_Camionnette_X70_200204_.jpeg',
    'CABSTAR': 'CABSTAR_F24M_F24W_200609_-_201312.jpeg',
    'VANETTE': 'VANETTE_Camionnette_C22_198610_-_201112.jpeg',
    'VANETTE CARGO': 'VANETTE_CARGO_Camionnette_HC_23_199409_-_200205.jpeg',
    'PRIMASTAR': 'PRIMASTAR_AutobusAutocar_X83_200103_.jpeg',
    'SERENA': 'SERENA_C26_201011_-_201607.jpeg',
    '300ZX': '300_ZX_Z32_198909_-_200012.jpeg',
    '280ZX': '280_ZXZXT_HGS130_197807_-_198405.jpeg'
  },
  'dacia': {
    'SANDERO': 'SANDERO_II_201210_.jpeg',
    'SANDERO II': 'SANDERO_II_201210_.jpeg',
    'LOGAN': 'LOGAN_II_201210_.jpeg',
    'LOGAN II': 'LOGAN_II_201210_.jpeg',
    'LOGAN MCV': 'LOGAN_MCV_II_201302_.jpeg',
    'LOGAN MCV II': 'LOGAN_MCV_II_201302_.jpeg',
    'LOGAN LS': 'LOGAN_LS__200408_.jpeg',
    'LOGAN EXPRESS': 'LOGAN_EXPRESS_FS__200903_.jpeg',
    'LOGAN PICK-UP': 'LOGAN_Pick-up_US__200803_.jpeg',
    'DUSTER': 'DUSTER_HS__201004_-_201801.png',
    'DUSTER CAMIONNETTE': 'DUSTER_Camionnette_201104_.png',
    'LODGY': 'LODGY_JS__201203_.png',
    'DOKKER': 'DOKKER_KE__201211_.jpeg',
    'DOKKER EXPRESS': 'DOKKER_Express_201211_.png',
    'SOLENZA': 'SOLENZA_B41__200302_.jpeg',
    '1300': '1300_197212_-_198305.jpeg',
    '1300 BREAK': '1300_Break_197212_-_198305.jpeg',
    '1310': '1310_A_trois_volumes_U_X_198305_-_200407.jpeg',
    '1310 A TROIS VOLUMES': '1310_A_trois_volumes_U_X_198305_-_200407.jpeg',
    '1310 BREAK': '1310_Break_198305_-_200407.jpeg',
    '1304 PICK UP': 'LOGAN_Pick-up_US__200803_.jpeg',
    '1307 CAMION PLATE FORME CHÂSSIS': 'DUSTER_Camionnette_201104_.png',
    '1309 CAMION PLATE FORME CHÂSSIS': 'DUSTER_Camionnette_201104_.png',
    '1309 PICK UP': 'LOGAN_Pick-up_US__200803_.jpeg',
    '1410 BREAK': '1310_Break_198305_-_200407.jpeg',
    '1410 A TROIS VOLUMES': '1310_A_trois_volumes_U_X_198305_-_200407.jpeg',
    '1210': '1300_197212_-_198305.jpeg',
    'PICK UP': 'LOGAN_Pick-up_US__200803_.jpeg',
    '1325': '1300_197212_-_198305.jpeg',
    '1100': '1300_197212_-_198305.jpeg',
    '1310 COUPE U': '1310_A_trois_volumes_U_X_198305_-_200407.jpeg',
    'SPRING': 'SANDERO_II_201210_.jpeg',
    'JOGGER RK': 'LODGY_JS__201203_.png',
    'BIGSTER': 'DUSTER_HS__201004_-_201801.png',
    'SPRING CARGO': 'DOKKER_Express_201211_.png',
    'NOVA': '1310_A_trois_volumes_U_X_198305_-_200407.jpeg',
    'SUPERNOVA': '1310_Break_198305_-_200407.jpeg'
  }
}

/**
 * Get model image filename based on manufacturer and model name
 */
export function getModelImageFilename(manufacturerName: string, modelName: string): string {
  const manufacturer = manufacturerName.toLowerCase()
  const mapping = MODEL_IMAGE_MAPPINGS[manufacturer]
  
  if (!mapping) {
    return generateFallbackFilename(modelName)
  }

  // Clean and normalize model name for better matching
  const cleanModelName = modelName.toUpperCase().trim()
  
  // Try exact match first
  const exactMatch = mapping[cleanModelName]
  if (exactMatch) {
    return exactMatch
  }

  // Try partial matches - both ways
  for (const [key, filename] of Object.entries(mapping)) {
    const cleanKey = key.toUpperCase().trim()
    
    // Check if model name contains the key or vice versa
    if (cleanModelName.includes(cleanKey) || cleanKey.includes(cleanModelName)) {
      return filename
    }
    
    // Check for word-based matching (split by spaces/underscores)
    const modelWords = cleanModelName.split(/[\s_]+/).filter(word => word.length > 0)
    const keyWords = cleanKey.split(/[\s_]+/).filter(word => word.length > 0)
    
    // If any significant word matches
    for (const modelWord of modelWords) {
      if (modelWord.length > 2) { // Only match words longer than 2 characters
        for (const keyWord of keyWords) {
          if (keyWord.length > 2 && (modelWord.includes(keyWord) || keyWord.includes(modelWord))) {
            return filename
          }
        }
      }
    }
  }

  // Fallback to generated filename
  return generateFallbackFilename(modelName)
}

/**
 * Generate fallback filename from model name
 */
function generateFallbackFilename(modelName: string): string {
  const cleanName = modelName
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase()
  
  return `${cleanName}.jpeg`
}

/**
 * Get model image URL with fallback
 */
export function getModelImageUrl(manufacturerName: string, modelName: string): string {
  const manufacturer = manufacturerName.toLowerCase()
  const filename = getModelImageFilename(manufacturerName, modelName)
  return `/models/${manufacturer}/${filename}`
}

/**
 * Check if model image exists (client-side check)
 */
export function checkModelImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/**
 * Get model display name (cleaned up for UI)
 */
export function getModelDisplayName(modelName: string): string {
  return modelName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}
