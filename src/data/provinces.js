export const PROVINCES_DISTRICTS = {
  Central: ['Chibombo', 'Chisamba', 'Chitambo', 'Kabwe', 'Kapiri Mposhi', 'Luano', 'Mkushi', 'Mumbwa', 'Ngabwe', 'Serenje'],
  Copperbelt: ['Chililabombwe', 'Chingola', 'Kalulushi', 'Kitwe', 'Lufwanyama', 'Luanshya', 'Masaiti', 'Mpongwe', 'Mufulira', 'Ndola'],
  Eastern: ['Chadiza', 'Chama', 'Chipata', 'Lumezi', 'Lundazi', 'Mambwe', 'Msanzala', 'Nyimba', 'Petauke', 'Sinda', 'Vubwi'],
  Luapula: ['Bahati', 'Chembe', 'Chiengi', 'Chipili', 'Kawambwa', 'Lunga', 'Mansa', 'Milenge', 'Mwansabombwe', 'Mwense', 'Nchelenge', 'Samfya'],
  Lusaka: ['Chilanga', 'Chongwe', 'Chirundu', 'Kafue', 'Luangwa', 'Lusaka', 'Rufunsa', 'Shibuyunji'],
  Muchinga: ['Chinsali', 'Isoka', 'Kanchibiya', 'Lavushimanda', 'Mafinga', 'Mpika', 'Nakonde', "Shiwang'andu"],
  Northern: ['Chilubi', 'Kaputa', 'Kasama', 'Lunte', 'Lupososhi', 'Luwingu', 'Mbala', 'Mporokoso', 'Mpulungu', 'Mungwi', 'Nsama'],
  'North-Western': ['Chavuma', 'Ikelenge', 'Kabompo', 'Kalumbila', 'Kasempa', 'Lumwana', 'Mufumbwe', 'Mushindamo', 'Mwinilunga', 'Solwezi', 'Zambezi'],
  Southern: ['Chikankata', 'Choma', 'Gwembe', 'Itezhi-Tezhi', 'Kalomo', 'Kazungula', 'Livingstone', 'Mazabuka', 'Monze', 'Namwala', 'Pemba', 'Siavonga', 'Sinazongwe', 'Zimba'],
  Western: ['Kalabo', 'Kaoma', 'Limulunga', 'Lukulu', 'Mangango', 'Mitete', 'Mongu', 'Mulobezi', 'Mwandi', 'Nalolo', 'Nkeyema', 'Senanga', 'Sesheke', 'Shangombo', 'Sikongo', 'Sioma'],
};

export function getProvinces() {
  return Object.keys(PROVINCES_DISTRICTS).sort();
}

export function getDistricts(province) {
  return (PROVINCES_DISTRICTS[province] || []).sort();
}
