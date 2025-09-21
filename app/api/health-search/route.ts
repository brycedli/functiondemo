import { NextRequest, NextResponse } from 'next/server'

// Comprehensive biomarker data across all health categories
const DUMMY_HEALTH_DATA = {
  "heart_cardiovascular": {
    "apolipoprotein_b": "95 mg/dL (normal: <90)",
    "cholesterol_hdl_ratio": "3.5 (normal: <4.5)",
    "hdl_cholesterol": "55 mg/dL (normal: >40 men, >50 women)",
    "hdl_large": "12.5 umol/L (normal: 7.3-18.8)",
    "ldl_cholesterol": "125 mg/dL (normal: <100) - ELEVATED",
    "ldl_medium": "485 nmol/L (normal: 158-603)",
    "ldl_particle_number": "1250 nmol/L (normal: <1000) - HIGH",
    "ldl_pattern": "Pattern A (normal: Pattern A)",
    "ldl_peak_size": "21.2 nm (normal: >20.5)",
    "ldl_small": "315 nmol/L (normal: <527)",
    "lipoprotein_a": "25 mg/dL (normal: <30)",
    "non_hdl_cholesterol": "145 mg/dL (normal: <130)",
    "total_cholesterol": "200 mg/dL (normal: <200)",
    "triglycerides": "110 mg/dL (normal: <150)"
  },
  "thyroid": {
    "tsh": "2.8 mIU/L (normal: 0.4-4.0)",
    "free_t4": "1.2 ng/dL (normal: 0.8-1.8)",
    "free_t3": "3.1 pg/mL (normal: 2.3-4.2)",
    "thyroglobulin_antibodies": "15 IU/mL (normal: <40)",
    "tpo_antibodies": "8 IU/mL (normal: <35)"
  },
  "cancer_detection": {
    "galleri_test": "Signal Not Detected (normal: Signal Not Detected)"
  },
  "autoimmunity": {
    "ana_pattern": "Negative (normal: Negative)",
    "ana_titer": "<1:80 (normal: <1:80)",
    "celiac_iga": "2.5 U/mL (normal: <20)",
    "celiac_igg": "3.2 U/mL (normal: <20)",
    "celiac_ttg_iga": "1.8 U/mL (normal: <20)",
    "rheumatoid_factor": "12 IU/mL (normal: <14)"
  },
  "immune_regulation": {
    "hs_crp": "1.8 mg/L (normal: <3.0)",
    "wbc_count": "6.8 K/uL (normal: 4.0-11.0)",
    "neutrophils": "4.2 K/uL (normal: 2.0-7.5)",
    "lymphocytes": "1.9 K/uL (normal: 1.0-4.0)",
    "monocytes": "0.5 K/uL (normal: 0.2-1.0)",
    "eosinophils": "0.15 K/uL (normal: 0.0-0.4)",
    "basophils": "0.05 K/uL (normal: 0.0-0.2)"
  },
  "female_health": {
    "amh": "3.2 ng/mL (normal: 1.0-4.0)",
    "estradiol": "85 pg/mL (normal: 30-400, varies by cycle)",
    "fsh": "6.5 mIU/mL (normal: 3.5-12.5)",
    "lh": "8.2 mIU/mL (normal: 2.4-12.6)",
    "prolactin": "15 ng/mL (normal: 4.8-23.3)"
  },
  "male_health": {
    "testosterone": "650 ng/dL (normal: 264-916)",
    "psa": "1.2 ng/mL (normal: <4.0)",
    "estradiol_male": "25 pg/mL (normal: 8-35)",
    "fsh_male": "4.5 mIU/mL (normal: 1.5-12.4)",
    "lh_male": "5.8 mIU/mL (normal: 1.7-8.6)"
  },
  "stress_aging": {
    "cortisol": "12.5 ug/dL (normal: 6.2-19.4)",
    "dhea_sulfate": "285 ug/dL (normal: 164-530)",
    "biological_age": "32 years (chronological: 35 years) - YOUNGER"
  },
  "metabolic": {
    "glucose": "92 mg/dL (normal: 70-100)",
    "hba1c": "5.4% (normal: <5.7%)",
    "insulin": "8.5 uIU/mL (normal: 2.6-24.9)",
    "leptin": "12.8 ng/mL (normal: 1.1-27.5)",
    "uric_acid": "5.2 mg/dL (normal: 3.4-7.0)"
  },
  "nutrients": {
    "aa_epa_ratio": "8.5 (normal: <11)",
    "copper": "115 ug/dL (normal: 70-175)",
    "ferritin": "85 ng/mL (normal: 15-150)",
    "homocysteine": "9.2 umol/L (normal: <15)",
    "iron": "95 ug/dL (normal: 60-170)",
    "iron_saturation": "28% (normal: 20-50%)",
    "tibc": "340 ug/dL (normal: 250-450)",
    "magnesium": "2.1 mg/dL (normal: 1.7-2.2)",
    "mma": "185 nmol/L (normal: <271)",
    "omega3_total": "5.8% (normal: >8%) - LOW",
    "omega6_total": "35.2% (normal: 24-36%)",
    "omega6_omega3_ratio": "6.1 (normal: <4) - HIGH",
    "vitamin_d": "32 ng/mL (normal: 30-100)",
    "selenium": "125 ug/L (normal: 70-150)",
    "zinc": "85 ug/dL (normal: 66-110)"
  },
  "liver_function": {
    "alt": "28 U/L (normal: 7-56)",
    "albumin": "4.2 g/dL (normal: 3.5-5.0)",
    "alp": "75 U/L (normal: 44-147)",
    "ast": "24 U/L (normal: 10-40)",
    "ggt": "22 U/L (normal: 9-48)",
    "total_bilirubin": "0.9 mg/dL (normal: 0.3-1.2)",
    "total_protein": "7.1 g/dL (normal: 6.0-8.3)"
  },
  "kidneys": {
    "bun": "16 mg/dL (normal: 7-20)",
    "bun_creatinine_ratio": "18 (normal: 10-20)",
    "creatinine": "0.9 mg/dL (normal: 0.6-1.2)",
    "egfr": ">60 mL/min/1.73m² (normal: >60)",
    "microalbumin_urine": "15 mg/g creatinine (normal: <30)"
  },
  "pancreas": {
    "amylase": "65 U/L (normal: 28-100)",
    "lipase": "35 U/L (normal: 10-140)"
  },
  "heavy_metals": {
    "aluminum": "8 ug/L (normal: <15)",
    "arsenic": "12 ug/L (normal: <50)",
    "lead": "2.5 ug/dL (normal: <5)",
    "mercury": "3.2 ug/L (normal: <10)"
  },
  "electrolytes": {
    "calcium": "9.8 mg/dL (normal: 8.5-10.5)",
    "chloride": "102 mEq/L (normal: 98-107)",
    "sodium": "140 mEq/L (normal: 136-145)",
    "potassium": "4.2 mEq/L (normal: 3.5-5.0)",
    "co2_bicarbonate": "24 mEq/L (normal: 22-29)"
  },
  "blood": {
    "abo_rh": "O+ (Type O, Rh Positive)",
    "hematocrit": "42.5% (normal: 36.0-46.0)",
    "hemoglobin": "14.2 g/dL (normal: 12.0-15.5)",
    "mch": "30.5 pg (normal: 27.0-33.0)",
    "mchc": "34.2 g/dL (normal: 32.0-36.0)",
    "mcv": "89 fL (normal: 80-100)",
    "mpv": "10.2 fL (normal: 7.4-10.4)",
    "platelet_count": "285 K/uL (normal: 150-450)",
    "rbc_count": "4.6 M/uL (normal: 4.2-5.4)",
    "rdw": "13.2% (normal: 11.5-14.5)"
  },
  "urine": {
    "urine_albumin": "12 mg/g creatinine (normal: <30)",
    "appearance": "Clear (normal: Clear)",
    "bacteria": "None (normal: None-Few)",
    "bilirubin": "Negative (normal: Negative)",
    "clarity": "Clear (normal: Clear)",
    "color": "Yellow (normal: Yellow)",
    "glucose_urine": "Negative (normal: Negative)",
    "hyaline_casts": "0-2/hpf (normal: 0-2/hpf)",
    "ketones": "Negative (normal: Negative)",
    "leukocytes": "Negative (normal: Negative)",
    "nitrite": "Negative (normal: Negative)",
    "occult_blood": "Negative (normal: Negative)",
    "ph": "6.2 (normal: 4.6-8.0)",
    "protein_urine": "Negative (normal: Negative)",
    "rbc_urine": "0-1/hpf (normal: 0-2/hpf)",
    "specific_gravity": "1.018 (normal: 1.003-1.030)",
    "squamous_cells": "Few (normal: Few)",
    "wbc_urine": "0-2/hpf (normal: 0-5/hpf)",
    "yeast": "None (normal: None)"
  },
  "infections_std": {
    "lyme_antibodies": "Negative (normal: Negative)",
    "chlamydia": "Not Detected (normal: Not Detected)",
    "gonorrhea": "Not Detected (normal: Not Detected)",
    "hsv1": "IgG Positive (past infection)",
    "hsv2": "IgG Negative (normal: Negative)",
    "hiv": "Non-Reactive (normal: Non-Reactive)",
    "syphilis_rpr": "Non-Reactive (normal: Non-Reactive)"
  },
  "genetics_risk": {
    "apoe_genotype": "ε3/ε3 (normal risk for Alzheimer's)"
  },
  "allergies_sensitivities": {
    "food_allergy_milk": "0.15 kU/L (normal: <0.35)",
    "food_allergy_egg": "0.08 kU/L (normal: <0.35)",
    "food_allergy_peanut": "0.12 kU/L (normal: <0.35)",
    "food_allergy_tree_nuts": "0.05 kU/L (normal: <0.35)",
    "food_allergy_shellfish": "0.22 kU/L (normal: <0.35)",
    "food_allergy_wheat": "0.18 kU/L (normal: <0.35)",
    "environmental_dust_mite": "0.45 kU/L (normal: <0.35) - MILD ALLERGY",
    "environmental_cat": "0.28 kU/L (normal: <0.35)",
    "environmental_dog": "0.15 kU/L (normal: <0.35)",
    "environmental_grass": "0.65 kU/L (normal: <0.35) - MILD ALLERGY",
    "environmental_ragweed": "0.38 kU/L (normal: <0.35) - MILD ALLERGY",
    "environmental_mold": "0.12 kU/L (normal: <0.35)"
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    const relevantData: any = {}
    const queryLower = query.toLowerCase()
    
    // Split query into individual terms for better matching
    const queryTerms = queryLower.split(/\s+/)
    
    // Check if query contains specific category names
    const requestedCategories = Object.keys(DUMMY_HEALTH_DATA).filter(category => 
      queryTerms.some((term: string) => 
        category.replace(/_/g, ' ').includes(term) || 
        term.includes(category.replace(/_/g, ' '))
      )
    )
    
    // If specific categories are requested, return those categories
    if (requestedCategories.length > 0) {
      requestedCategories.forEach(category => {
        relevantData[category] = DUMMY_HEALTH_DATA[category as keyof typeof DUMMY_HEALTH_DATA]
      })
    } else {
      // Otherwise, search through all categories for biomarker matches
      Object.entries(DUMMY_HEALTH_DATA).forEach(([category, data]) => {
        Object.entries(data).forEach(([test, value]) => {
          const testName = test.replace(/_/g, ' ')
          const categoryName = category.replace(/_/g, ' ')
          
          // Check if any query term matches the test name, category, or abnormal values
          const isMatch = queryTerms.some((term: string) => 
            testName.includes(term) ||
            term.includes(testName) ||
            categoryName.includes(term) ||
            (typeof value === 'string' && (
              value.toLowerCase().includes('low') ||
              value.toLowerCase().includes('high') ||
              value.toLowerCase().includes('elevated') ||
              value.toLowerCase().includes('allergy')
            ))
          )
          
          if (isMatch) {
            if (!relevantData[category]) {
              relevantData[category] = {}
            }
            relevantData[category][test] = value
          }
        })
      })
    }
    
    // If no specific matches, return a subset of commonly requested data
    if (Object.keys(relevantData).length === 0) {
      relevantData.metabolic = DUMMY_HEALTH_DATA.metabolic
      relevantData.nutrients = DUMMY_HEALTH_DATA.nutrients
      relevantData.heart_cardiovascular = DUMMY_HEALTH_DATA.heart_cardiovascular
    }
    
    return NextResponse.json({ 
      data: relevantData,
      categories_searched: requestedCategories.length > 0 ? requestedCategories : 'all',
      query_terms: queryTerms
    })
  } catch (error) {
    console.error('Health search error:', error)
    return NextResponse.json({ error: 'Failed to search health data' }, { status: 500 })
  }
}
