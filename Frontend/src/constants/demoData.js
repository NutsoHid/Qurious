export const DEMO_USERS = {
  rambabu: {
    id: 'rambabu', // Must match the key name 'rambabu'
    username: 'Rambabu Mandal',
    handle: '@rambabumandal_5',
    profileImage: 'https://scontent-bom5-1.cdninstagram.com/v/t51.82787-19/658195603_18100368338486817_6084200744651801554_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bom5-1.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2gHSm4nRUMc8j5sW7Y9S-B5Vhba39r-vT2eFb6lkKQ-590lF-SSrXR-PG0kLhZYQZN9R-MFHh-GFvFKZHKxjEIjw&_nc_ohc=bzBp5h1EiWcQ7kNvwHSWaeM&_nc_gid=id54h41PCcrmP4CrlL65Yw&edm=AIhb9MIBAAAA&ccb=7-5&oh=00_Af5AFuSuw2kKye3YcUrkhCU9tmCtJ_zx1TGOhUxVsbNqfQ&oe=69FBB81D&_nc_sid=8aafe2', 
    followers: 1250,
    following: 450,
    role: 'admin',
    bio: 'Health expert & AI enthusiast.'
  },
  prithivi: {
    id: 'prithivi', 
    username: 'Prithivi Karki',
    handle: '@Prithivikarki29',
    profileImage: 'https://scontent-bom5-1.cdninstagram.com/v/t51.82787-19/670766002_18356450200233809_1200611405327688499_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bom5-1.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gFGNd-4Bw-LwU28Nyv6x-kYMN2eWNuJEawc1Jx2CbvPn6Nw8zki518G-pi4xhmFlIctwblvWnA70KTmbWlYx67z&_nc_ohc=OBA7exABaFUQ7kNvwHfpLON&_nc_gid=laDmj3N9ZXguhGwPz85BEw&edm=AIhb9MIBAAAA&ccb=7-5&oh=00_Af4Am89Qvzp31jsOp-Dc6xgBtyk0I2QR7SXnpG9FfcXLMw&oe=69FBBB88&_nc_sid=8aafe2',
    followers: 890,
    following: 210,
    role: 'admin',
    bio: 'Building better neighborhoods.'
  },
  prajwal: {
    id: 'prajwal',
    username: 'Prajwal Jha',
    handle: '@prajwaljha25',
    profileImage: 'https://scontent-bom2-3.cdninstagram.com/v/t51.82787-19/670915716_18001947581872803_5818453873779004145_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bom2-3.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2gFiwNmZX_cnEGNmsGGBipxZxI9Hy2TTUFKmgkBzPAo5LXERZRwNrLt1-bKpXlTkWQF2DkD8ElcEAvcB7GS_GJ-d&_nc_ohc=x8sTO05ry7oQ7kNvwH5XizZ&_nc_gid=H-PbYw3w3heuqWUVFe642A&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af4XK7QBPVpozbsI4J1GdnGzKanNicO2vpKo7dFOzr96Dg&oe=69FBBAE9&_nc_sid=7a9f4b',
    followers: 2100,
    following: 550,
    role: 'user',
    bio: 'Bridging the digital divide.'
  }
};

export const DEMO_POSTS = [
  { 
    id: '1', 
    category: 'Health', 
    authorId: 'rambabu', // Correctly points to DEMO_USERS.rambabu.id
    time: '2h', 
    caption: 'Wellness over everything', 
    image: 'https://cdn.educba.com/academy/wp-content/uploads/2024/06/7-Basic-Health-Tips.png' 
  },
  { 
    id: '2', 
    category: 'Social', 
    authorId: 'prithivi', // Correctly points to DEMO_USERS.prithivi.id
    time: '4h', 
    caption: 'How can we improve local park accessibility?', 
    image: 'https://doulton.in/wp-content/uploads/2019/11/The-Garden-City-of-Indias-the-frightening-progress-towards-the-inevitable-in-2020.jpg' 
  },
  { 
    id: '10', 
    category: 'Social', 
    authorId: 'prajwal', // Correctly points to DEMO_USERS.prajwal.id
    time: '3d', 
    caption: 'Bridging the digital divide in our senior community.', 
    image: 'https://www.suburblive.in/wp-content/uploads/2021/08/Golden-agers-1024x536.jpg' 
  },
];