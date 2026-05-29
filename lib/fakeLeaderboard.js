// Fake leaderboard data generator with 358 believable African names
// Names update positions every 3 minutes to simulate real competition

const FIRST_NAMES = [
  'Ada', 'Amara', 'Chioma', 'Zuri', 'Nia', 'Aisha', 'Fatima', 'Kemi', 'Yara', 'Zara',
  'Kofi', 'Kwame', 'Chidi', 'Tunde', 'Segun', 'Emeka', 'Ade', 'Bayo', 'Femi', 'Jide',
  'Amina', 'Halima', 'Mariam', 'Safiya', 'Zahra', 'Kadija', 'Rashida', 'Naima', 'Layla', 'Jamila',
  'Kwesi', 'Yaw', 'Kojo', 'Akwasi', 'Nana', 'Kofi', 'Ama', 'Abena', 'Efua', 'Adjoa',
  'Thabo', 'Sipho', 'Mandla', 'Bongani', 'Sizwe', 'Nkosi', 'Themba', 'Jabu', 'Mpho', 'Lerato',
  'Amani', 'Baraka', 'Juma', 'Rashid', 'Salim', 'Hamisi', 'Aziza', 'Neema', 'Furaha', 'Upendo',
  'Chinedu', 'Obinna', 'Ikenna', 'Nnamdi', 'Kelechi', 'Adaeze', 'Ngozi', 'Ifeoma', 'Uchenna', 'Oluchi',
  'Kwabena', 'Akosua', 'Yaa', 'Kwaku', 'Afua', 'Ekua', 'Abenaa', 'Akua', 'Adwoa', 'Esi',
  'Tendai', 'Tinashe', 'Rumbi', 'Nyasha', 'Tapiwa', 'Chipo', 'Rudo', 'Tsitsi', 'Farai', 'Simba',
  'Naledi', 'Kagiso', 'Tebogo', 'Kefilwe', 'Lesedi', 'Boitumelo', 'Kgotso', 'Refilwe', 'Tumelo', 'Karabo',
  'Abiola', 'Babatunde', 'Folake', 'Gbemisola', 'Oluwatoyin', 'Titilayo', 'Ayodele', 'Oluwaseun', 'Adebayo', 'Omolara',
  'Musa', 'Ibrahim', 'Yusuf', 'Ismail', 'Hassan', 'Hussain', 'Bilal', 'Omar', 'Khalid', 'Tariq',
  'Eshe', 'Imani', 'Asha', 'Makena', 'Wanjiru', 'Njeri', 'Akinyi', 'Atieno', 'Awino', 'Adhiambo',
  'Sekou', 'Mamadou', 'Ousmane', 'Abdoulaye', 'Boubacar', 'Amadou', 'Moussa', 'Souleymane', 'Ibrahima', 'Lamine',
  'Ayo', 'Dele', 'Kunle', 'Lanre', 'Wale', 'Yemi', 'Tosin', 'Dayo', 'Gbenga', 'Seyi',
  'Chiamaka', 'Chinwe', 'Ebere', 'Ifunanya', 'Nkechi', 'Nneka', 'Obiageli', 'Ogechi', 'Ugochi', 'Adanna',
  'Kwame', 'Koffi', 'Yao', 'Edem', 'Selorm', 'Senyo', 'Dela', 'Mawuli', 'Elikem', 'Kafui',
  'Thandiwe', 'Nomsa', 'Zanele', 'Nandi', 'Lindiwe', 'Busisiwe', 'Nokuthula', 'Thulisile', 'Sibongile', 'Nompumelelo',
  'Kwanza', 'Jabari', 'Kamau', 'Kiano', 'Mwangi', 'Njoroge', 'Otieno', 'Omondi', 'Wekesa', 'Mutua',
  'Ama', 'Akosua', 'Abena', 'Adwoa', 'Afia', 'Esi', 'Efua', 'Aba', 'Araba', 'Ajoa',
  'Bandile', 'Dumisani', 'Khanyisile', 'Lungile', 'Mthunzi', 'Nkosinathi', 'Sandile', 'Siyabonga', 'Vusi', 'Xolani',
  'Amara', 'Chibueze', 'Dubem', 'Ebuka', 'Ifeanyi', 'Kamsi', 'Munachi', 'Nnamdi', 'Somto', 'Zikora',
  'Akua', 'Ama', 'Efua', 'Esi', 'Abena', 'Adwoa', 'Afia', 'Akosua', 'Ama', 'Araba',
  'Blessing', 'Chukwudi', 'Divine', 'Emmanuel', 'Favour', 'Gift', 'Hope', 'Innocent', 'Justice', 'Mercy',
  'Nana', 'Osei', 'Poku', 'Sarpong', 'Mensah', 'Boateng', 'Owusu', 'Asante', 'Appiah', 'Agyei',
  'Precious', 'Promise', 'Prosper', 'Rejoice', 'Success', 'Testimony', 'Triumph', 'Victory', 'Wisdom', 'Wonderful',
  'Abasi', 'Bakari', 'Dakarai', 'Faraji', 'Jabari', 'Kamari', 'Omari', 'Rafiki', 'Simba', 'Tau',
  'Adaeze', 'Amarachi', 'Chidinma', 'Chizoba', 'Ijeoma', 'Nkemdilim', 'Oluchi', 'Somtochukwu', 'Uchenna', 'Zikora',
  'Abidemi', 'Adebola', 'Adewale', 'Afolabi', 'Akinwale', 'Bolaji', 'Damilola', 'Oluwafemi', 'Temitope', 'Yetunde',
  'Chuma', 'Dumisani', 'Khethiwe', 'Mandisa', 'Noluthando', 'Siphokazi', 'Thembeka', 'Zandile', 'Zinhle', 'Zodwa',
  'Abubakar', 'Aliyu', 'Bashir', 'Garba', 'Kabir', 'Murtala', 'Nasiru', 'Sani', 'Umar', 'Yakubu',
  'Chisom', 'Ebube', 'Kosisochukwu', 'Mmesoma', 'Nneoma', 'Oluebube', 'Somadina', 'Tobechukwu', 'Uchechukwu', 'Zikora',
  'Akachi', 'Chukwuemeka', 'Ikechukwu', 'Nnamdi', 'Obinna', 'Onyekachi', 'Tochukwu', 'Ugochukwu', 'Chinedu', 'Emeka',
  'Adesola', 'Ayomide', 'Boluwatife', 'Damilare', 'Oluwaseyi', 'Temiloluwa', 'Titilope', 'Toluwani', 'Oluwatobi', 'Ayodeji',
  'Katlego', 'Lebogang', 'Mmabatho', 'Oratile', 'Phenyo', 'Rethabile', 'Tshegofatso', 'Keabetswe', 'Boipelo', 'Goitseone',
  'Chikondi', 'Limbani', 'Mphatso', 'Pemphero', 'Tadala', 'Takondwa', 'Tamandani', 'Thokozani', 'Yamikani', 'Zikomo'
]

const LAST_NAMES = [
  'Okonkwo', 'Adeyemi', 'Mensah', 'Kamau', 'Nkosi', 'Diallo', 'Mwangi', 'Osei', 'Banda', 'Moyo',
  'Okoro', 'Adeola', 'Boateng', 'Njoroge', 'Dlamini', 'Traore', 'Otieno', 'Asante', 'Phiri', 'Ndlovu',
  'Eze', 'Oluwole', 'Owusu', 'Wanjiru', 'Khumalo', 'Keita', 'Omondi', 'Appiah', 'Tembo', 'Sibanda',
  'Chukwu', 'Afolayan', 'Mensah', 'Mutua', 'Zulu', 'Cisse', 'Wekesa', 'Agyei', 'Mbewe', 'Ncube',
  'Nwosu', 'Babatunde', 'Sarpong', 'Kimani', 'Mahlangu', 'Toure', 'Onyango', 'Poku', 'Lungu', 'Mokoena',
  'Okafor', 'Adebayo', 'Boakye', 'Kariuki', 'Sithole', 'Kone', 'Achieng', 'Ofori', 'Sakala', 'Maseko',
  'Nnadi', 'Ogunleye', 'Antwi', 'Maina', 'Ngcobo', 'Diarra', 'Odhiambo', 'Amoah', 'Chanda', 'Nkomo',
  'Obi', 'Oyedepo', 'Darko', 'Githinji', 'Radebe', 'Sangare', 'Okoth', 'Frimpong', 'Zulu', 'Kone',
  'Agu', 'Olaniyan', 'Gyasi', 'Ndungu', 'Mthembu', 'Coulibaly', 'Oluoch', 'Yeboah', 'Mwale', 'Dube',
  'Ike', 'Adewumi', 'Mensah', 'Wambua', 'Cele', 'Sidibe', 'Ouma', 'Acheampong', 'Banda', 'Moyo'
]

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia', 'Tanzania', 'Uganda',
  'Rwanda', 'Senegal', 'Côte d\'Ivoire', 'Cameroon', 'Morocco', 'Algeria', 'Tunisia',
  'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Mozambique', 'Angola', 'DR Congo',
  'Mali', 'Burkina Faso', 'Niger', 'Sierra Leone', 'Liberia', 'Gambia', 'Madagascar', 'Mauritius'
]

// Simple seeded RNG so names/countries are stable per index
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

// Generate 358 fake users with stable IDs (seeded so names never change)
function generateFakeUsers() {
  const users = []
  for (let i = 0; i < 358; i++) {
    const firstName = FIRST_NAMES[Math.floor(seededRand(i * 3) * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(seededRand(i * 3 + 1) * LAST_NAMES.length)]
    const country = COUNTRIES[Math.floor(seededRand(i * 3 + 2) * COUNTRIES.length)]

    const code = `${firstName.substring(0, 3).toUpperCase()}${lastName.substring(0, 3).toUpperCase()}${String(i).padStart(2, '0')}`

    let baseReferrals
    if (i < 10) {
      baseReferrals = 100 + Math.floor(seededRand(i + 1000) * 120) // 100-220
    } else if (i < 30) {
      baseReferrals = 40 + Math.floor(seededRand(i + 1000) * 50)  // 40-90
    } else if (i < 100) {
      baseReferrals = 10 + Math.floor(seededRand(i + 1000) * 30)  // 10-40
    } else {
      baseReferrals = 1 + Math.floor(seededRand(i + 1000) * 10)   // 1-11
    }

    users.push({
      id: `fake_${i}`,
      fullName: `${firstName} ${lastName}`,
      country,
      referralCode: code,
      baseReferrals,
      isFake: true,
      priorityUnlocked: baseReferrals >= 7
    })
  }
  return users
}

// Calculate dynamic referral count based on time — stays in realistic range
// Shifts every 3 minutes to simulate competition
function getDynamicReferralCount(user, currentTime) {
  const block = Math.floor(currentTime / 180000)
  const seed = parseInt(user.id.replace('fake_', ''))

  // Small fluctuation: ±3 based on time block, stays near baseReferrals
  const fluctuation = Math.floor(Math.sin(block * 0.7 + seed) * 8)

  return Math.max(user.baseReferrals + fluctuation, 1)
}

// Get merged leaderboard (fake + real users)
export function getMergedLeaderboard(realUsers, limit = 10) {
  const currentTime = Date.now()
  const fakeUsers = generateFakeUsers()
  
  // Add dynamic referral counts to fake users
  const dynamicFakeUsers = fakeUsers.map(user => ({
    ...user,
    referralCount: getDynamicReferralCount(user, currentTime)
  }))
  
  // Format real users to match structure
  const formattedRealUsers = realUsers.map(user => ({
    ...user,
    isFake: false
  }))
  
  // Merge and sort by referral count
  const merged = [...dynamicFakeUsers, ...formattedRealUsers]
    .sort((a, b) => {
      if (b.referralCount !== a.referralCount) {
        return b.referralCount - a.referralCount
      }
      // If same count, real users get priority
      if (a.isFake && !b.isFake) return 1
      if (!a.isFake && b.isFake) return -1
      return 0
    })
  
  return merged.slice(0, limit)
}

// Get stats including fake users
export function getMergedStats(realTotal, realPriority) {
  const baseFake = 12847 // Keep the social proof base
  const fakeUsersCount = 358
  const fakePriorityCount = Math.floor(fakeUsersCount * 0.35) // ~35% have priority
  
  return {
    total: realTotal,
    priority: realPriority,
    displayCount: baseFake + realTotal + fakeUsersCount,
    totalWithFakes: realTotal + fakeUsersCount,
    priorityWithFakes: realPriority + fakePriorityCount
  }
}
