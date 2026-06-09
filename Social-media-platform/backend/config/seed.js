const bcrypt = require('bcryptjs');
const { getDb, run, query } = require('./database');

async function seed() {
  await getDb();
  console.log('Seeding Synvora...');
  const hp = bcrypt.hashSync('password123', 10);

  const users = [
    { u:'alex_morgan',   f:'Alex Morgan',    e:'synvora@gmail.com',   b:'📸 Photographer | 🌍 Traveler | ☕ Coffee addict',                  p:'https://i.pravatar.cc/150?img=1'  },
    { u:'sarah_designs', f:'Sarah Chen',     e:'sarah@gmail.com',     b:'🎨 UI/UX Designer | Making the web beautiful one pixel at a time',  p:'https://i.pravatar.cc/150?img=5'  },
    { u:'dev_mike',      f:'Mike Johnson',   e:'mike@gmail.com',      b:'💻 Full Stack Dev | Open Source | 🎮 Gamer',                        p:'https://i.pravatar.cc/150?img=3'  },
    { u:'emma_writes',   f:'Emma Wilson',    e:'emma@gmail.com',      b:'✍️ Writer | Storyteller | Cat mom 🐱',                              p:'https://i.pravatar.cc/150?img=9'  },
    { u:'jake_fitness',  f:'Jake Torres',    e:'jake@gmail.com',      b:'💪 Personal Trainer | Nutrition Coach',                             p:'https://i.pravatar.cc/150?img=7'  },
    { u:'aarav_sharma',  f:'Aarav Sharma',   e:'aarav@gmail.com',     b:'🚀 Indie Developer | Mumbai | Building cool stuff with code ☕',    p:'https://i.pravatar.cc/150?img=12' },
    { u:'priya_reddy',   f:'Priya Reddy',    e:'priya@gmail.com',     b:'🎨 Digital Artist | Hyderabad | Colors speak louder than words 🌸', p:'https://i.pravatar.cc/150?img=47' },
    { u:'arjun_patel',   f:'Arjun Patel',    e:'arjun@gmail.com',     b:'💻 SDE @ Bangalore | 🏏 Cricket fanatic | Chai > Coffee',           p:'https://i.pravatar.cc/150?img=15' },
    { u:'sneha_verma',   f:'Sneha Verma',    e:'sneha@gmail.com',     b:'📱 Product Manager | Delhi | Obsessed with user experiences ✨',    p:'https://i.pravatar.cc/150?img=44' },
    { u:'vikram_rao',    f:'Vikram Rao',     e:'vikram@gmail.com',    b:'🤖 AI/ML Engineer | Pune | Turning data into magic 🔮',             p:'https://i.pravatar.cc/150?img=13' },
    { u:'ananya_iyer',   f:'Ananya Iyer',    e:'ananya@gmail.com',    b:'🧘 Wellness Coach | Chennai | Yoga + Code + Chai = Life 🌿',        p:'https://i.pravatar.cc/150?img=48' },
    { u:'rahul_krishna', f:'Rahul Krishna',  e:'rahul@gmail.com',     b:'📷 Street Photographer | Kolkata | Every frame tells a story 🎞️',  p:'https://i.pravatar.cc/150?img=16' },
    { u:'kavya_singh',   f:'Kavya Singh',    e:'kavya@gmail.com',     b:'✍️ Content Creator | Jaipur | Words are my superpower 💫',          p:'https://i.pravatar.cc/150?img=49' },
    { u:'rohan_mehta',   f:'Rohan Mehta',    e:'rohan@gmail.com',     b:'🎵 Music Producer | Mumbai | Making beats that hit different 🎧',   p:'https://i.pravatar.cc/150?img=17' },
    { u:'ishita_nair',   f:'Ishita Nair',    e:'ishita@gmail.com',    b:'🌍 Travel Blogger | Kerala | 35 states explored, 0 regrets 🌴',    p:'https://i.pravatar.cc/150?img=46' },
  ];

  for (const u of users) {
    try { run('INSERT OR IGNORE INTO users (username,fullname,email,password,bio,profile_image) VALUES(?,?,?,?,?,?)',
      [u.u, u.f, u.e, hp, u.b, u.p]); } catch(e) {}
  }

  const ids = query('SELECT id FROM users ORDER BY id LIMIT 15').map(r => r.id);
  if (!ids.length) { console.log('Already seeded.'); return; }

  const posts = [
    { uid:ids[0],  img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', c:'Just captured this stunning sunrise over the Himalayas! 🌄 #photography #travel #nature #india' },
    { uid:ids[1],  img:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', c:'Finished redesigning our app onboarding flow. Clean, minimal, user-friendly 🎨 #design #ux #ui' },
    { uid:ids[2],  img:'', c:'Just shipped a massive update! 50+ commits, 3 sleepless nights, infinite chai ⚡ #coding #webdev' },
    { uid:ids[3],  img:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800', c:'Working on my new short story collection. Best inspiration hits at 2am ☕📚 #writing #books' },
    { uid:ids[4],  img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', c:'5am workout done! The energy lasts ALL day 💪🔥 Who else is in the 5am club? #fitness #motivation' },
    { uid:ids[0],  img:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', c:'Hidden gem café in Pondicherry — perfect espresso, zero crowds 😌☕ #coffee #travel #india' },
    { uid:ids[1],  img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', c:'Spent 3 hours picking the perfect color palette. Color theory is underrated 🎨 #design' },
    { uid:ids[2],  img:'', c:'Hot take: Write comments that explain WHY not WHAT. Your future self will thank you 🙏 #programming' },
    { uid:ids[5],  img:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', c:'Built a full-stack app in 48hrs for hackathon! Placed 2nd 🚀 Sleep is overrated #hackathon #india' },
    { uid:ids[6],  img:'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800', c:'New digital artwork inspired by Hyderabad 🎨✨ Old City vibes hit different #art #hyderabad #india' },
    { uid:ids[7],  img:'', c:'Late night debugging fuelled by filter coffee ☕ 3am bug fix = pure dopamine #bangalore #coding' },
    { uid:ids[8],  img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', c:'Launched our new feature today! 6 months of planning paid off 📱✨ #productmanagement #startup' },
    { uid:ids[9],  img:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800', c:'New paper on transformer optimization! Reducing inference time by 40% 🤖🔬 #AI #ML #research' },
    { uid:ids[10], img:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', c:'Morning yoga on Marina Beach 🧘‍♀️🌅 Starting the week with intention #yoga #wellness #chennai' },
    { uid:ids[11], img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', c:'Golden hour at Howrah Bridge 📷✨ Kolkata has raw beauty no other city matches #photography #kolkata' },
    { uid:ids[12], img:'', c:'Just hit 10K words on my novel! Characters start arguing with your plot 😂✍️ #amwriting #jaipur' },
    { uid:ids[13], img:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', c:'New beat: Carnatic classical meets electronic — this is FIRE 🎵🔥 #music #mumbai #producer' },
    { uid:ids[14], img:'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', c:'Backwaters of Kerala at dawn 🌴 This is what peace looks like #kerala #travel #india #wanderlust' },
    { uid:ids[5],  img:'', c:'AI-generated unit tests that actually work 🤯 The future is here and it slaps #AI #coding' },
    { uid:ids[6],  img:'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800', c:'Recreating Madhubani art in digital form 🎨 Preserving culture through tech #art #india #digitalart' },
  ];

  for (const p of posts) {
    try { run('INSERT OR IGNORE INTO posts (user_id,content,image,hashtags) VALUES(?,?,?,?)',
      [p.uid, p.c, p.img, (p.c.match(/#\w+/g)||[]).join(',')]); } catch(e) {}
  }

  const pids = query('SELECT id FROM posts ORDER BY id').map(r => r.id);

  [[0,1],[0,2],[0,5],[0,14],[1,0],[1,2],[1,8],[2,0],[2,5],[2,7],[3,0],[3,12],
   [4,0],[4,1],[5,0],[5,6],[5,9],[5,14],[6,5],[6,11],[7,5],[7,6],[8,5],[8,1],
   [9,5],[9,0],[10,6],[10,14],[11,5],[11,8],[12,5],[13,6],[14,0],[14,6]]
  .forEach(([fi,ti]) => {
    if (ids[fi]&&ids[ti]) try { run('INSERT OR IGNORE INTO followers(follower_id,following_id) VALUES(?,?)',[ids[fi],ids[ti]]); } catch(e) {}
  });

  for (let pi=0; pi<Math.min(pids.length,20); pi++) {
    const n=3+Math.floor(Math.random()*7);
    for (let li=0; li<n&&li<ids.length; li++) {
      const uid=ids[(pi+li*3)%ids.length];
      if (uid&&pids[pi]) try { run('INSERT OR IGNORE INTO likes(user_id,post_id) VALUES(?,?)',[uid,pids[pi]]); } catch(e) {}
    }
  }

  [[ids[1],pids[0],'Breathtaking! 😍 What camera?'],[ids[2],pids[0],'Where exactly was this?'],
   [ids[0],pids[1],'Love the clean approach!'],[ids[3],pids[2],'Congrats on the ship! 🚀'],
   [ids[6],pids[9],'This is gorgeous! Love it 🙏'],[ids[14],pids[17],'Kerala mornings = pure magic 🌴']]
  .forEach(([u,p,c]) => {
    if (u&&p) try { run('INSERT OR IGNORE INTO comments(user_id,post_id,content) VALUES(?,?,?)',[u,p,c]); } catch(e) {}
  });

  for (let pi=0; pi<Math.min(pids.length,20); pi++) {
    const n=3+Math.floor(Math.random()*8);
    for (let vi=0; vi<n&&vi<ids.length; vi++) {
      const uid=ids[(pi+vi*2)%ids.length];
      if (uid&&pids[pi]) try { run('INSERT OR IGNORE INTO post_views(user_id,post_id) VALUES(?,?)',[uid,pids[pi]]); } catch(e) {}
    }
  }

  console.log('Synvora seeded!');
}

seed().catch(console.error).finally(() => process.exit());
