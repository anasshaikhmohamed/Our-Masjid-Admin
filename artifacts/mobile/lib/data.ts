import type { ImageSourcePropType } from 'react-native';

export type Project = {
  id: string;
  name: string;
  location: string;
  category: string;
  status: 'Active' | 'Urgent' | 'Completed';
  description: string;
  problem: string;
  target: number;
  raised: number;
  image: ImageSourcePropType;
  verification: string;
  workTitle?: string;
  beforeImages?: ImageSourcePropType[];
  progressImages?: ImageSourcePropType[];
  afterImages?: ImageSourcePropType[];
};

export const projects: Project[] = [
  {
    id: 'al-noor',
    name: 'Masjid Al-Noor Renovation',
    location: 'Dharavi, Mumbai',
    category: 'Renovation',
    status: 'Active',
    description:
      'Complete renovation of prayer hall flooring, walls, and ceiling. This Masjid serves over 400 families daily.',
    problem:
      'The prayer hall flooring is uneven and the ceiling has water damage from the monsoon. The renovation will create a safer, brighter space for families and children who gather here every day.',
    target: 500000,
    raised: 190000,
    image: require('@/assets/images/masjid-exterior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'ibrahim-wudu',
    name: 'Masjid Ibrahim Wudu Area',
    location: 'Bandra, Mumbai',
    category: 'Plumbing',
    status: 'Urgent',
    description:
      'New wudu area construction with proper drainage, clean water lines, and accessible washing stations.',
    problem:
      'The current wudu area has leaking pipes and poor drainage. A new layout is needed before the next monsoon season to protect worshippers and the building foundation.',
    target: 320000,
    raised: 43200,
    image: require('@/assets/images/masjid-interior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'rahman-electrical',
    name: 'Masjid Ar-Rahman Electrical',
    location: 'Kurla, Mumbai',
    category: 'Electrical',
    status: 'Active',
    description:
      'Safe rewiring, energy-efficient lighting, and new fans for a cooler prayer space.',
    problem:
      'Old wiring has become unreliable and several prayer hall lights are no longer safe to use.',
    target: 180000,
    raised: 126000,
    image: require('@/assets/images/masjid-exterior.jpg'),
    verification: 'Under verification',
  },
  {
    id: 'khidmat-roof',
    name: 'Masjid Khidmat Roof Repair',
    location: 'Kurla, Mumbai',
    category: 'Roofing',
    status: 'Urgent',
    description: 'Repair the prayer hall roof, seal monsoon leaks, and protect the building before the next heavy rains.',
    problem: 'Water is entering through the roof above the main prayer hall. Immediate repairs will prevent damage to the ceiling, wiring, and floor.',
    target: 420000,
    raised: 64800,
    image: require('@/assets/images/masjid-khidmat-exterior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'amanah-access',
    name: 'Masjid Amanah Accessibility',
    location: 'Jogeshwari, Mumbai',
    category: 'Construction',
    status: 'Active',
    description: 'Build a safer entrance ramp and accessible washroom for elderly worshippers and families.',
    problem: 'The current entrance has steps only, making daily prayers difficult for wheelchair users and older community members.',
    target: 275000,
    raised: 146000,
    image: require('@/assets/images/masjid-amanah-interior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'salam-classroom',
    name: 'Masjid As-Salam Classroom',
    location: 'Bhandup, Mumbai',
    category: 'Construction',
    status: 'Urgent',
    description: 'Convert an unfinished side room into a safe learning space for evening Quran and community classes.',
    problem: 'Children currently share a cramped corridor for evening classes. The unfinished room needs flooring, lighting, and ventilation.',
    target: 360000,
    raised: 52200,
    image: require('@/assets/images/masjid-salam-exterior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'taqwa-water',
    name: 'Masjid At-Taqwa Water Lines',
    location: 'Malad, Mumbai',
    category: 'Plumbing',
    status: 'Urgent',
    description: 'Replace damaged water lines and add reliable storage for the prayer hall and wudu area.',
    problem: 'Unreliable water supply is affecting wudu access during peak prayer times. New lines and a storage tank are needed.',
    target: 295000,
    raised: 38800,
    image: require('@/assets/images/masjid-taqwa-interior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'hidayah-lighting',
    name: 'Masjid Al-Hidayah Lighting',
    location: 'Ghatkopar, Mumbai',
    category: 'Electrical',
    status: 'Urgent',
    description: 'Install safe wiring, efficient lights, and ceiling fans across the main prayer hall.',
    problem: 'Old wiring and failing lights leave dark areas in the prayer hall and create a safety risk for worshippers.',
    target: 240000,
    raised: 41200,
    image: require('@/assets/images/masjid-hidayah-exterior.jpg'),
    verification: 'Under verification',
  },
  {
    id: 'falah-wudu',
    name: 'Masjid Al-Falah Wudu Upgrade',
    location: 'Powai, Mumbai',
    category: 'Plumbing',
    status: 'Active',
    description: 'Upgrade wudu stations with non-slip flooring, new taps, and better drainage.',
    problem: 'The existing area becomes slippery during busy prayer times and requires a safer, easier-to-clean layout.',
    target: 210000,
    raised: 96500,
    image: require('@/assets/images/masjid-falah-wudu.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'ihsan-solar',
    name: 'Masjid Al-Ihsan Solar Power',
    location: 'Vikhroli, Mumbai',
    category: 'Electrical',
    status: 'Active',
    description: 'Add rooftop solar panels to reduce monthly electricity costs and keep community services running.',
    problem: 'High electricity bills limit the Masjid’s ability to fund classes and maintenance. Solar can reduce long-term operating costs.',
    target: 580000,
    raised: 204000,
    image: require('@/assets/images/masjid-ihsan-exterior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'sabr-learning',
    name: 'Masjid As-Sabr Learning Room',
    location: 'Mira Road, Mumbai',
    category: 'Renovation',
    status: 'Active',
    description: 'Refresh the community learning room with flooring, shelving, paint, and safe study lighting.',
    problem: 'The learning room is used every day but needs basic repairs and storage before more students can join.',
    target: 185000,
    raised: 78500,
    image: require('@/assets/images/masjid-sabr-interior.jpg'),
    verification: 'Under verification',
  },
  {
    id: 'noorani-courtyard',
    name: 'Masjid Noorani Courtyard',
    location: 'Wadala, Mumbai',
    category: 'Construction',
    status: 'Active',
    description: 'Repair the courtyard paving and improve rainwater drainage around the entrance.',
    problem: 'Broken paving and standing rainwater make the entrance unsafe for children, elders, and daily visitors.',
    target: 330000,
    raised: 117000,
    image: require('@/assets/images/masjid-noorani-exterior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
  {
    id: 'rahma-flooring',
    name: 'Masjid Ar-Rahma Flooring',
    location: 'Santacruz, Mumbai',
    category: 'Renovation',
    status: 'Active',
    description: 'Replace worn prayer hall flooring with durable, easy-care surfaces for year-round community use.',
    problem: 'The old flooring is uneven and difficult to clean after daily prayers and weekend classes.',
    target: 410000,
    raised: 188000,
    image: require('@/assets/images/masjid-rahma-interior.jpg'),
    verification: 'Verified by Our Masjid review team',
  },
];

export const completedProjects = [
  {
    id: 'al-furqan',
    name: 'Masjid Al-Furqan',
    location: 'Sion, Mumbai',
    category: 'Renovation',
    description:
      'Complete interior renovation including new flooring, fresh paint, and improved ventilation. The Masjid now serves 600+ worshippers comfortably.',
    amount: 250000,
    before: require('@/assets/images/masjid-interior.jpg'),
    after: require('@/assets/images/masjid-exterior.jpg'),
  },
  {
    id: 'al-huda',
    name: 'Masjid Al-Huda',
    location: 'Andheri, Mumbai',
    category: 'Plumbing',
    description:
      'Complete wudu area reconstruction with 12 new stations, proper drainage, non-slip tiles, and 24-hour water supply.',
    amount: 120000,
    before: require('@/assets/images/masjid-interior.jpg'),
    after: require('@/assets/images/masjid-exterior.jpg'),
  },
];

export const raisedBreakdown = projects.map(({ name, location, raised }) => ({ name, location, raised }));

export const totalRaised = raisedBreakdown.reduce((total, item) => total + item.raised, 0);

export const formatINR = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

export const progressFor = (project: Pick<Project, 'target' | 'raised'>) =>
  Math.min(100, Math.round((project.raised / project.target) * 100));
