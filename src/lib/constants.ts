export type MeasurementTag = string;

export interface MeasurementFieldDef {
  id: string;
  labelUrdu: string;
  labelEnglish: string;
  availableTags: MeasurementTag[];
}

export interface GarmentTemplate {
  id: string;
  name: string;
  nameUrdu: string;
  fields: MeasurementFieldDef[];
}

export const SHALWAR_QAMEEZ_TEMPLATE: GarmentTemplate = {
  id: 'shalwar-qameez',
  name: 'Shalwar Qameez',
  nameUrdu: 'شلوار قمیض',
  fields: [
    {
      id: 'length',
      labelUrdu: 'لمبائی',
      labelEnglish: 'Length',
      availableTags: ['پٹی بین 1 1/4', 'پونی پٹی', 'بین پٹی انچ', 'بین پٹی 1 1/2', 'ہاف بین', 'فل بین'],
    },
    {
      id: 'teera',
      labelUrdu: 'تیرا',
      labelEnglish: 'Shoulder',
      availableTags: [],
    },
    {
      id: 'baazu',
      labelUrdu: 'بازو',
      labelEnglish: 'Sleeve',
      availableTags: ['کف (Cuff)', 'بازو گول'],
    },
    {
      id: 'gala',
      labelUrdu: 'گلہ',
      labelEnglish: 'Neck',
      availableTags: [],
    },
    {
      id: 'chaati',
      labelUrdu: 'چھاتی',
      labelEnglish: 'Chest',
      availableTags: [],
    },
    {
      id: 'kamar',
      labelUrdu: 'کمر',
      labelEnglish: 'Waist',
      availableTags: [],
    },
    {
      id: 'ghera',
      labelUrdu: 'گھیرا',
      labelEnglish: 'Hem',
      availableTags: ['گھیرا چورس', 'گھیرا گول'],
    },
    {
      id: 'shalwar',
      labelUrdu: 'شلوار',
      labelEnglish: 'Shalwar',
      availableTags: ['فرنٹ پاکٹ', 'سائیڈ پاکٹ'],
    },
    {
      id: 'pancha_kat',
      labelUrdu: 'پانچہ کاٹ',
      labelEnglish: 'Pancha Kat',
      availableTags: [],
    },
    {
      id: 'jaali_pancha',
      labelUrdu: 'جالی والا پانچہ',
      labelEnglish: 'Jaali Pancha',
      availableTags: [],
    },
    {
      id: 'zip',
      labelUrdu: 'زپ',
      labelEnglish: 'Zip',
      availableTags: [],
    },
    {
      id: 'kanta',
      labelUrdu: 'کانٹا',
      labelEnglish: 'Kanta',
      availableTags: [],
    },
    {
      id: 'stitching',
      labelUrdu: 'سلائی کی تفصیلات',
      labelEnglish: 'Stitching Details',
      availableTags: ['گھوم سلائی', 'ڈبل سلائی', 'سنگل سلائی'],
    }
  ]
};

export const GARMENT_TEMPLATES: GarmentTemplate[] = [
  SHALWAR_QAMEEZ_TEMPLATE,
  {
    id: 'waistcoat',
    name: 'Waistcoat',
    nameUrdu: 'واسکوٹ',
    fields: [
      { id: 'length', labelUrdu: 'لمبائی', labelEnglish: 'Length', availableTags: [] },
      { id: 'chest', labelUrdu: 'چھاتی', labelEnglish: 'Chest', availableTags: [] },
      { id: 'waist', labelUrdu: 'کمر', labelEnglish: 'Waist', availableTags: [] },
    ]
  },
  {
    id: 'shirt',
    name: 'Shirt',
    nameUrdu: 'قمیض',
    fields: [
      { id: 'length', labelUrdu: 'لمبائی', labelEnglish: 'Length', availableTags: [] },
      { id: 'shoulder', labelUrdu: 'تیرا', labelEnglish: 'Shoulder', availableTags: [] },
      { id: 'sleeve', labelUrdu: 'بازو', labelEnglish: 'Sleeve', availableTags: ['Cuff', 'Half'] },
      { id: 'chest', labelUrdu: 'چھاتی', labelEnglish: 'Chest', availableTags: [] },
    ]
  }
];
