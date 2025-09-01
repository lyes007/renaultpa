interface Country {
  id: number
  couCode: string
  countryName: string
}

interface CountriesResponse {
  countries: Country[]
}

/**
 * Fetch all available countries from the API
 * @returns Promise with countries data or error
 */
export async function getAllCountries(): Promise<{ data?: Country[], error?: string }> {
  try {
    console.log('[CountriesAPI] Fetching all countries...')
    
    const response = await fetch('/api/apify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectPageType: 'get-all-countries',
        langId: 6, // Default language for country names
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[CountriesAPI] API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('[CountriesAPI] Raw response:', data)

    if (data && Array.isArray(data) && data.length > 0) {
      const countriesData = data[0] as CountriesResponse
      
      if (countriesData.countries && Array.isArray(countriesData.countries)) {
        console.log(`[CountriesAPI] Successfully fetched ${countriesData.countries.length} countries`)
        return { data: countriesData.countries }
      }
    }

    console.warn('[CountriesAPI] Unexpected response format:', data)
    return { error: 'Invalid response format from countries API' }
    
  } catch (error) {
    console.error('[CountriesAPI] Error fetching countries:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch countries' }
  }
}

/**
 * Get comprehensive list of countries based on the example data provided
 */
export function getAllCountriesList(): Country[] {
  return [
    { id: 1, couCode: "A", countryName: "Austria" },
    { id: 2, couCode: "ADN", countryName: "Yemen (People's Democratic Republic)" },
    { id: 3, couCode: "AEU", countryName: "Except Europe" },
    { id: 4, couCode: "AFG", countryName: "Afghanistan" },
    { id: 5, couCode: "AIA", countryName: "Anguilla" },
    { id: 6, couCode: "TN", countryName: "Tunisia" },
    { id: 7, couCode: "AL", countryName: "Albania" },
    { id: 8, couCode: "AM", countryName: "Central America" },
    { id: 9, couCode: "AN", countryName: "Netherlands Antilles" },
    { id: 10, couCode: "AND", countryName: "Andorra" },
    { id: 11, couCode: "ANG", countryName: "Angola" },
    { id: 12, couCode: "ANZ", countryName: "Australia and New Zealand" },
    { id: 13, couCode: "APA", countryName: "Asia/Pacific" },
    { id: 14, couCode: "AQ", countryName: "Antarctica" },
    { id: 15, couCode: "ARM", countryName: "Armenia" },
    { id: 16, couCode: "AS", countryName: "South America" },
    { id: 17, couCode: "ASE", countryName: "ASEAN" },
    { id: 18, couCode: "ASM", countryName: "American Samoa" },
    { id: 19, couCode: "ATG", countryName: "Antigua" },
    { id: 20, couCode: "AUS", countryName: "Australia" },
    { id: 21, couCode: "AUT", countryName: "Austria" },
    { id: 22, couCode: "AZE", countryName: "Azerbaijan" },
    { id: 23, couCode: "B", countryName: "Belgium" },
    { id: 24, couCode: "BDG", countryName: "Bangladesh" },
    { id: 25, couCode: "BEL", countryName: "Belgium" },
    { id: 26, couCode: "BEN", countryName: "Benin" },
    { id: 27, couCode: "BFA", countryName: "Burkina Faso" },
    { id: 28, couCode: "BGD", countryName: "Bangladesh" },
    { id: 29, couCode: "BGR", countryName: "Bulgaria" },
    { id: 30, couCode: "BHR", countryName: "Bahrain" },
    { id: 31, couCode: "BIH", countryName: "Bosnia and Herzegovina" },
    { id: 32, couCode: "BLR", countryName: "Belarus" },
    { id: 33, couCode: "BLZ", countryName: "Belize" },
    { id: 34, couCode: "BOL", countryName: "Bolivia" },
    { id: 35, couCode: "BRA", countryName: "Brazil" },
    { id: 36, couCode: "BRB", countryName: "Barbados" },
    { id: 37, couCode: "BRN", countryName: "Brunei" },
    { id: 38, couCode: "BTN", countryName: "Bhutan" },
    { id: 39, couCode: "BWA", countryName: "Botswana" },
    { id: 40, couCode: "CAF", countryName: "Central African Republic" },
    { id: 41, couCode: "CAN", countryName: "Canada" },
    { id: 42, couCode: "CHE", countryName: "Switzerland" },
    { id: 43, couCode: "CHL", countryName: "Chile" },
    { id: 44, couCode: "CHN", countryName: "China" },
    { id: 45, couCode: "CIV", countryName: "Côte d'Ivoire" },
    { id: 46, couCode: "CMR", countryName: "Cameroon" },
    { id: 47, couCode: "COD", countryName: "Democratic Republic of the Congo" },
    { id: 48, couCode: "COG", countryName: "Republic of the Congo" },
    { id: 49, couCode: "COL", countryName: "Colombia" },
    { id: 50, couCode: "COM", countryName: "Comoros" },
    { id: 51, couCode: "CPV", countryName: "Cape Verde" },
    { id: 52, couCode: "CRI", countryName: "Costa Rica" },
    { id: 53, couCode: "CUB", countryName: "Cuba" },
    { id: 54, couCode: "CYP", countryName: "Cyprus" },
    { id: 55, couCode: "CZE", countryName: "Czech Republic" },
    { id: 56, couCode: "D", countryName: "Germany" },
    { id: 57, couCode: "DEU", countryName: "Germany" },
    { id: 58, couCode: "DJI", countryName: "Djibouti" },
    { id: 59, couCode: "DMA", countryName: "Dominica" },
    { id: 60, couCode: "DNK", countryName: "Denmark" },
    { id: 61, couCode: "DOM", countryName: "Dominican Republic" },
    { id: 62, couCode: "DZ", countryName: "Algeria" },
    { id: 63, couCode: "DZA", countryName: "Algeria" },
    { id: 64, couCode: "E", countryName: "Spain" },
    { id: 65, couCode: "ECU", countryName: "Ecuador" },
    { id: 66, couCode: "EGY", countryName: "Egypt" },
    { id: 67, couCode: "ERI", countryName: "Eritrea" },
    { id: 68, couCode: "ESP", countryName: "Spain" },
    { id: 69, couCode: "EST", countryName: "Estonia" },
    { id: 70, couCode: "ETH", countryName: "Ethiopia" },
    { id: 71, couCode: "F", countryName: "France" },
    { id: 72, couCode: "FIN", countryName: "Finland" },
    { id: 73, couCode: "FJI", countryName: "Fiji" },
    { id: 74, couCode: "FRA", countryName: "France" },
    { id: 75, couCode: "GAB", countryName: "Gabon" },
    { id: 76, couCode: "GB", countryName: "United Kingdom" },
    { id: 77, couCode: "GBR", countryName: "United Kingdom" },
    { id: 78, couCode: "GEO", countryName: "Georgia" },
    { id: 79, couCode: "GHA", countryName: "Ghana" },
    { id: 80, couCode: "GIN", countryName: "Guinea" },
    { id: 81, couCode: "GMB", countryName: "Gambia" },
    { id: 82, couCode: "GNB", countryName: "Guinea-Bissau" },
    { id: 83, couCode: "GNQ", countryName: "Equatorial Guinea" },
    { id: 84, couCode: "GRC", countryName: "Greece" },
    { id: 85, couCode: "GRD", countryName: "Grenada" },
    { id: 86, couCode: "GTM", countryName: "Guatemala" },
    { id: 87, couCode: "GUY", countryName: "Guyana" },
    { id: 88, couCode: "HND", countryName: "Honduras" },
    { id: 89, couCode: "HRV", countryName: "Croatia" },
    { id: 90, couCode: "HTI", countryName: "Haiti" },
    { id: 91, couCode: "HUN", countryName: "Hungary" },
    { id: 92, couCode: "I", countryName: "Italy" },
    { id: 93, couCode: "IDN", countryName: "Indonesia" },
    { id: 94, couCode: "IND", countryName: "India" },
    { id: 95, couCode: "IRL", countryName: "Ireland" },
    { id: 96, couCode: "IRN", countryName: "Iran" },
    { id: 97, couCode: "IRQ", countryName: "Iraq" },
    { id: 98, couCode: "ISL", countryName: "Iceland" },
    { id: 99, couCode: "ISR", countryName: "Israel" },
    { id: 100, couCode: "ITA", countryName: "Italy" },
    { id: 101, couCode: "JAM", countryName: "Jamaica" },
    { id: 102, couCode: "JOR", countryName: "Jordan" },
    { id: 103, couCode: "JPN", countryName: "Japan" },
    { id: 104, couCode: "KAZ", countryName: "Kazakhstan" },
    { id: 105, couCode: "KEN", countryName: "Kenya" },
    { id: 106, couCode: "KGZ", countryName: "Kyrgyzstan" },
    { id: 107, couCode: "KHM", countryName: "Cambodia" },
    { id: 108, couCode: "KIR", countryName: "Kiribati" },
    { id: 109, couCode: "KNA", countryName: "Saint Kitts and Nevis" },
    { id: 110, couCode: "KOR", countryName: "South Korea" },
    { id: 111, couCode: "KWT", countryName: "Kuwait" },
    { id: 112, couCode: "LAO", countryName: "Laos" },
    { id: 113, couCode: "LBN", countryName: "Lebanon" },
    { id: 114, couCode: "LBR", countryName: "Liberia" },
    { id: 115, couCode: "LBY", countryName: "Libya" },
    { id: 116, couCode: "LCA", countryName: "Saint Lucia" },
    { id: 117, couCode: "LIE", countryName: "Liechtenstein" },
    { id: 118, couCode: "LKA", countryName: "Sri Lanka" },
    { id: 119, couCode: "LSO", countryName: "Lesotho" },
    { id: 120, couCode: "LTU", countryName: "Lithuania" },
    { id: 121, couCode: "LUX", countryName: "Luxembourg" },
    { id: 122, couCode: "LVA", countryName: "Latvia" },
    { id: 123, couCode: "MAC", countryName: "Macau" },
    { id: 124, couCode: "MAR", countryName: "Morocco" },
    { id: 125, couCode: "MCO", countryName: "Monaco" },
    { id: 126, couCode: "MDA", countryName: "Moldova" },
    { id: 127, couCode: "MDG", countryName: "Madagascar" },
    { id: 128, couCode: "MDV", countryName: "Maldives" },
    { id: 129, couCode: "MEX", countryName: "Mexico" },
    { id: 130, couCode: "MHL", countryName: "Marshall Islands" },
    { id: 131, couCode: "MKD", countryName: "North Macedonia" },
    { id: 132, couCode: "MLI", countryName: "Mali" },
    { id: 133, couCode: "MLT", countryName: "Malta" },
    { id: 134, couCode: "MMR", countryName: "Myanmar" },
    { id: 135, couCode: "MNE", countryName: "Montenegro" },
    { id: 136, couCode: "MNG", countryName: "Mongolia" },
    { id: 137, couCode: "MOZ", countryName: "Mozambique" },
    { id: 138, couCode: "MRT", countryName: "Mauritania" },
    { id: 139, couCode: "MUS", countryName: "Mauritius" },
    { id: 140, couCode: "MWI", countryName: "Malawi" },
    { id: 141, couCode: "MYS", countryName: "Malaysia" },
    { id: 142, couCode: "NAM", countryName: "Namibia" },
    { id: 143, couCode: "NCL", countryName: "New Caledonia" },
    { id: 144, couCode: "NER", countryName: "Niger" },
    { id: 145, couCode: "NGA", countryName: "Nigeria" },
    { id: 146, couCode: "NIC", countryName: "Nicaragua" },
    { id: 147, couCode: "NIU", countryName: "Niue" },
    { id: 148, couCode: "NL", countryName: "Netherlands" },
    { id: 149, couCode: "NLD", countryName: "Netherlands" },
    { id: 150, couCode: "NOR", countryName: "Norway" },
    { id: 151, couCode: "NPL", countryName: "Nepal" },
    { id: 152, couCode: "NRU", countryName: "Nauru" },
    { id: 153, couCode: "NZL", countryName: "New Zealand" },
    { id: 154, couCode: "OMN", countryName: "Oman" },
    { id: 155, couCode: "PAK", countryName: "Pakistan" },
    { id: 156, couCode: "PAN", countryName: "Panama" },
    { id: 157, couCode: "PER", countryName: "Peru" },
    { id: 158, couCode: "PHL", countryName: "Philippines" },
    { id: 159, couCode: "PLW", countryName: "Palau" },
    { id: 160, couCode: "PNG", countryName: "Papua New Guinea" },
    { id: 161, couCode: "POL", countryName: "Poland" },
    { id: 162, couCode: "PRT", countryName: "Portugal" },
    { id: 163, couCode: "PRY", countryName: "Paraguay" },
    { id: 164, couCode: "PSE", countryName: "Palestine" },
    { id: 165, couCode: "QAT", countryName: "Qatar" },
    { id: 166, couCode: "ROU", countryName: "Romania" },
    { id: 167, couCode: "RUS", countryName: "Russia" },
    { id: 168, couCode: "RWA", countryName: "Rwanda" },
    { id: 169, couCode: "SAU", countryName: "Saudi Arabia" },
    { id: 170, couCode: "SDN", countryName: "Sudan" },
    { id: 171, couCode: "SEN", countryName: "Senegal" },
    { id: 172, couCode: "SGP", countryName: "Singapore" },
    { id: 173, couCode: "SLB", countryName: "Solomon Islands" },
    { id: 174, couCode: "SLE", countryName: "Sierra Leone" },
    { id: 175, couCode: "SLV", countryName: "El Salvador" },
    { id: 176, couCode: "SMR", countryName: "San Marino" },
    { id: 177, couCode: "SOM", countryName: "Somalia" },
    { id: 178, couCode: "SRB", countryName: "Serbia" },
    { id: 179, couCode: "SSD", countryName: "South Sudan" },
    { id: 180, couCode: "STP", countryName: "São Tomé and Príncipe" },
    { id: 181, couCode: "SUR", countryName: "Suriname" },
    { id: 182, couCode: "SVK", countryName: "Slovakia" },
    { id: 183, couCode: "SVN", countryName: "Slovenia" },
    { id: 184, couCode: "SWE", countryName: "Sweden" },
    { id: 185, couCode: "SWZ", countryName: "Eswatini" },
    { id: 186, couCode: "SYC", countryName: "Seychelles" },
    { id: 187, couCode: "SYR", countryName: "Syria" },
    { id: 188, couCode: "TCD", countryName: "Chad" },
    { id: 189, couCode: "TGO", countryName: "Togo" },
    { id: 190, couCode: "THA", countryName: "Thailand" },
    { id: 191, couCode: "TJK", countryName: "Tajikistan" },
    { id: 192, couCode: "TKM", countryName: "Turkmenistan" },
    { id: 193, couCode: "TLS", countryName: "East Timor" },
    { id: 253, couCode: "TN", countryName: "Tunisia" },
    { id: 195, couCode: "TON", countryName: "Tonga" },
    { id: 196, couCode: "TTO", countryName: "Trinidad and Tobago" },
    { id: 197, couCode: "TUN", countryName: "Tunisia" },
    { id: 198, couCode: "TUR", countryName: "Turkey" },
    { id: 199, couCode: "TUV", countryName: "Tuvalu" },
    { id: 200, couCode: "TWN", countryName: "Taiwan" },
    { id: 201, couCode: "TZA", countryName: "Tanzania" },
    { id: 202, couCode: "UGA", countryName: "Uganda" },
    { id: 203, couCode: "UKR", countryName: "Ukraine" },
    { id: 204, couCode: "URY", countryName: "Uruguay" },
    { id: 205, couCode: "USA", countryName: "United States" },
    { id: 206, couCode: "UZB", countryName: "Uzbekistan" },
    { id: 207, couCode: "VAT", countryName: "Vatican City" },
    { id: 208, couCode: "VCT", countryName: "Saint Vincent and the Grenadines" },
    { id: 209, couCode: "VEN", countryName: "Venezuela" },
    { id: 210, couCode: "VGB", countryName: "British Virgin Islands" },
    { id: 211, couCode: "VIR", countryName: "US Virgin Islands" },
    { id: 212, couCode: "VNM", countryName: "Vietnam" },
    { id: 213, couCode: "VUT", countryName: "Vanuatu" },
    { id: 214, couCode: "WSM", countryName: "Samoa" },
    { id: 215, couCode: "YEM", countryName: "Yemen" },
    { id: 216, couCode: "ZAF", countryName: "South Africa" },
    { id: 217, couCode: "ZMB", countryName: "Zambia" },
    { id: 218, couCode: "ZWE", countryName: "Zimbabwe" }
  ]
}

/**
 * Get commonly used countries (for quick selection)
 */
export function getCommonCountries(): Country[] {
  return [
    { id: 253, couCode: "TN", countryName: "Tunisia" },
    { id: 56, couCode: "D", countryName: "Germany" },
    { id: 71, couCode: "F", countryName: "France" },
    { id: 92, couCode: "I", countryName: "Italy" },
    { id: 64, couCode: "E", countryName: "Spain" },
    { id: 76, couCode: "GB", countryName: "United Kingdom" }
  ]
}
