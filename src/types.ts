export interface BannedBook {
  Title: string
  Author: string
  State: string
  District: string
  'Challenge/Removal'?: string
  'Date of Challenge/Removal'?: string
  'Ban Status'?: string
  'Type of Ban'?: string
  'Initiating Action'?: string
  'Origin of Challenge'?: string
}

export interface BooksByState {
  [state: string]: BannedBook[]
}

export interface BooksByCounty {
  [county: string]: BannedBook[]
}

export interface BooksByStateAndCounty {
  [state: string]: BooksByCounty
}

