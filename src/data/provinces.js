export const PROVINCES_DISTRICTS = {
  Central: ['Chibombo', 'Chisamba', 'Chitambo', 'Kabwe', 'Kapiri Mposhi', 'Luano', 'Mkushi', 'Mumbwa', 'Ngabwe', 'Serenje'],
  Copperbelt: ['Chililabombwe', 'Chingola', 'Kalulushi', 'Kitwe', 'Lufwanyama', 'Luanshya', 'Masaiti', 'Mpongwe', 'Mufulira', 'Ndola'],
  Eastern: ['Chadiza', 'Chama', 'Chipata', 'Lumezi', 'Lundazi', 'Mambwe', 'Msanzala', 'Nyimba', 'Petauke', 'Sinda', 'Vubwi'],
  Luapula: ['Bahati', 'Chembe', 'Chiengi', 'Chipili', 'Kawambwa', 'Lunga', 'Mansa', 'Milenge', 'Mwansabombwe', 'Mwense', 'Nchelenge', 'Samfya'],
  Lusaka: ['Chilanga', 'Chongwe', 'Chirundu', 'Kafue', 'Luangwa', 'Lusaka', 'Rufunsa', 'Shibuyunji'],
  Muchinga: ['Chinsali', 'Isoka', 'Kanchibiya', 'Lavushimanda', 'Mafinga', 'Mpika', 'Mushindamo', 'Nakonde', 'Shiwangandu'],
  Northern: ['Chilubi', 'Kaputa', 'Kasama', 'Lunte', 'Lupososhi', 'Luwingu', 'Mbala', 'Mporokoso', 'Mpulungu', 'Mungwi', 'Nsama', 'Senga Hill'],
  'North-Western': ['Chavuma', 'Ikelenge', 'Kabompo', 'Kalumbila', 'Kasempa', 'Kipushi', 'Lumwana', 'Mufumbwe', 'Mushindamo', 'Mwinilunga', 'Solwezi', 'Zambezi'],
  Southern: ['Chikankata', 'Chirundu', 'Choma', 'Gwembe', 'Itezhi-Tezhi', 'Kalomo', 'Kazungula', 'Livingstone', 'Mazabuka', 'Monze', 'Namwala', 'Pemba', 'Siavonga', 'Sinazongwe'],
  Western: ['Kalabo', 'Kaoma', 'Limulunga', 'Liyeta', 'Luampa', 'Lukulu', 'Mangango', 'Mitete', 'Mongu', 'Mulobezi', 'Mwandi', 'Nalolo', 'Nkeyema', 'Senanga', 'Sesheke', 'Shangombo', 'Sikongo', 'Sioma'],
};

export function getProvinces() {
  return Object.keys(PROVINCES_DISTRICTS);
}

export function getDistricts(province) {
  return PROVINCES_DISTRICTS[province] || [];
}
