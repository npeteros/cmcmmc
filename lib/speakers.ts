interface SpeakerDescription {
  title: string;
  descriptions: string[];
}

interface Speaker {
  name: string;
  role: string;
  topic: string;
  session: string;
  imgUrl: string;
  speakerDescriptions?: SpeakerDescription[];
  extra?: string;
}

export const SPEAKERS: Speaker[] = [
  {
    name: "Most Rev. Rex Andrew Alarcon",
    role: "Chair, Episcopal Commission on Social Communications (ECSC)",
    session: "Keynote",
    topic:
      '"To Work and to Take Care (Gen. 2:15): Human Dignity at the Heart of AI Innovation in Media Ministry"',
    imgUrl: "/speakers/archbishop-rex.jpg",
    speakerDescriptions: [
      {
        title: "Background",
        descriptions: [
          "His Grace, the Most Reverend Rex Andrew Clement Alarcon, Doctor of Divinity, was born in Daet, Camarines Norte on 06 August 1970 to +Armando Alveus Alarcon, Sr. Juanita Culvera Clement.",
        ],
      },
      {
        title: "Educational Background",
        descriptions: [
          "He finished Kindergarten, Preparatory and Elementary at the Naga Parochial School and Secondary at the Holy Rosary Minor Seminary.",
          "He obtained a Bachelor of Arts (AB) Major in Philosophy at the Holy Rosary College Seminary, Naga City; a Bachelors in Sacred Theology (S.T.B.) from the University of Santo Tomas Manila; Master of Arts in Higher Religious Studies (M.A.) from the University of Santo Tomas in Manila; a Licentiate in Sacred Theology (S.T.L.) from the University of Santo Tomas, Manila and a Licenza &ndash;Storia della Chiesa (Church History) from the Pontificia Universita Gregoriana in Rome.",
        ],
      },
      {
        title: "Priestly Ministry",
        descriptions: [
          "On November 11, 1995, Sem. Rex Andrew C. Alarcon was ordained Deacon by +Jaime Cardinal L. Sin. The following year, November 9, 1996, he was ordained a priest for the Archdiocese of Caceres by +Archbishop Leonardo Z. Legaspi, OP.",
          "On January 2, 2019, Pope Francis appointed Fr. Alarcon as the 4th Bishop of Daet. He was ordained Bishop on March 19, 2019, on the Solemnity of St. Joseph, by Archbishop Rolando J. Tria Tirona, OCD as principal consecrator, with Apostolic Nuncio Tito Adolfo C. Yllana and Bishop Manolo A. De los Santos as co-consecrators.",
          "At the retirement of Archbishop Rolando J. Tria Tirona, OCD, Bishop Alarcon was appointed 5th Metropolitan Archbishop of Caceres on February 22, 2024, Feast of the Chair of St. Peter, the Apostle. Last March 19, 2024, he completed 5 years of episcopal ministry in the Diocese of Daet.",
          "He was elected as the Chairman of the Catholic Bishops' Conference of the Philippines (CBCP) &ndash; Episcopal Commission on Social Communications in July 2025, with his term officially beginning on December 1, 2025.",
        ],
      },
    ],
  },
  {
    name: "Howie Severino",
    role: "GMA Broadcast Journalist",
    session: "Plenary Session 1",
    topic: '"To Work: Human Creativity in AI-Assisted Communication"',
    imgUrl: "/speakers/howie-severino.jpg",
    speakerDescriptions: [
      {
        title: "Background",
        descriptions: [
          'Horacio "Howie" Severino has been a journalist for nearly 40 years, and has produced over 200 TV documentaries.',
          "He is in his 24th year as a TV documentarist for I-Witness, one of the longest-running television shows in the Philippines. He is also a pioneering podcast host for GMA Integrated News.",
          "From 2009 to 2014, he was editor-in-chief of GMA News Online.",
          "Howie graduated from Tufts University with a degree in History, magna cum laude. He received his MA degree in Environmental Policy from Sussex University.",
        ],
      },
      {
        title: "Recognitions and Awards",
        descriptions: [
          "CMMA Best Newspaper Reporter (1991): Recognized for his outstanding work in print journalism prior to his prominent broadcast career.",
          "2000 National Book Award for Journalism: Shared as part of the Philippine Center for Investigative Journalism (PCIJ) for the book Betrayal of the Public Trust.",
          "Rotary Club of Manila Journalism Hall of Fame (2007)",
          "Titus Brandsma Award (2009): Received for Leadership in Journalism.",
          "Metrobank Foundation Journalist of the Year (2015)",
          "US International Film & Video Festival Gold Camera Award (2017): Won for the documentary Busal (Muzzled), which detailed the impact of the government's drug war on the urban poor.",
          "18th Gawad Tanglaw Awards (2020): Awarded Best Documentary for Ako si Patient 2828, a personal documentary chronicling his experience as an early COVID-19 survivor.",
          "Multiple-time winner (Hall of Fame) for Best Documentarist at the University of the Philippines Los Baños (UPLB) Gandingan Awards.",
          "In 2023, he was given the Balagtas literary award for his writings by the Unyon ng mga Manunulat ng Pilipinas.",
          "Metrobank Foundation Award for Continuing Excellence and Service (2024)",
          "The Howie Severino Podcast won the Best Educational Program at the 2023 Catholic Mass Media Awards (CMMA).",
        ],
      },
    ],
  },
  {
    name: "Gretchen Ho",
    role: "Broadcaster, journalist, athlete",
    session: "Plenary Session 2",
    topic: '"To Take Care: Truth in the Age of Deepfakes"',
    imgUrl: "/speakers/gretchen-ho.jpg",
    speakerDescriptions: [
      {
        title: "Background",
        descriptions: [
          "Gretchen Ho, better known as Woman In Action, came into public consciousness not as a part of the entertainment industry, but as an accomplished athlete.",
          'She played collegiate volleyball for the Ateneo Lady Eagles from 2008 to 2013, where she was a member of the "fab five" who brought Ateneo to their first back-to-back UAAP finals appearances. After which, she played professionally in the Philippine Super Liga (PSL) where her team won the 2014 Grand Prix Conference.',
          "She debuted in the hosting scene as one of the hosts of the sports magazine show “Gameday Weekend,” on Balls and ABS-CBN Sports+Action. Soon enough Gretchen branched out from hosting sports-themed shows and became an anchor, segment host, and field reporter for various ABS-CBN programs.",
        ],
      },
      {
        title: "Awards and Recognitions",
        descriptions: [
          "Asian Academy Creative Awards (2025): National Winner for Best Factual Presenter (Philippines) for her work on the One News program Morning Matters.",
          "Gawad Pilipino Awards: Best New Female Segment Host for the Year (2019) and Icon of the Year - Outstanding Female TV Presenter of the Year.",
          "Gawad Lasallianeta (2020): Most Outstanding Female Correspondent.",
          "Paragala Media Awards (2020): Best News Personality.",
        ],
      },
    ],
  },
  {
    name: "Alex Rich",
    role: "National Lead Manager of Corporate Partnership and Development, Make-A-Wish America",
    session: "Plenary Session 3",
    topic: "Income Generating Projects in the Church",
    imgUrl: "/speakers/alex-rich.jpg",
    speakerDescriptions: [
      {
        title: "Background",
        descriptions: [
          "Alex Rich is a laywoman from Albuquerque, New Mexico, in the Southwest United States.",
          "She has dedicated over 10 years of her professional career to guiding organizations, both secular and faith-based, in crafting and sharing their stories through communication and development.",
          "Alex is a fellow of the Vatican&apos;s Faith Communication in the Digital World program. She continues to serve with the Dicastery of Communication as an instructor and special projects manager. ",
          "She is currently the Senior Manager of Corporate Partnerships and Development for Make-A-Wish America, where she raises mission-critical funds to grant life-changing wishes for children with critical illnesses.",
        ],
      },
    ],
  },
  {
    session: "Breakout Session 1",
    name: "Rev. Fr. Albert Garong, SSP",
    role: 'Host of "The PadsCast"',
    topic: "The Power of Voice: Crafting Meaningful Audio Content",
    extra: '"The Storyteller\'s Toolkit: Writing & Interviewing"',
    imgUrl: "/speakers/fr-albert.jpg",
    speakerDescriptions: [
      {
        title: "Background",
        descriptions: [
          'Fr. Albert Garong is a priest of the Society of St. Paul, ordained on November 17, 2018. Currently serving as the Assistant Director for ST PAULS Creative, "Pads Albert" sits at the intersection of faith, media, and modern culture.',
          'A seasoned content creator, he has been producing and hosting “PadsCast” since 2020, a video podcast featuring candid, soulful conversations between priests and lay Catholics. His creative reach extends further through his digital persona, @Fatherbrews, where he expertly blends his roles as a priest and a barista. By merging the art of specialty coffee with the Gospel, he leads a unique mission of "coffee-evangelization" through original online content—including his "One Shot Homilies" series—as well as coffee pop-ups, bar takeovers, and the community-centered Kape Ni Maria.',
          "Fr. Albert earned his degrees in Philosophy and Communications from the St. Paul Seminary Foundation (2008) and completed his theological studies at the Loyola School of Theology, Ateneo de Manila University (2015). Today, he continues to leverage videography and specialty coffee as tools to make the Word of God accessible in the digital age.",
        ],
      },
    ],
  },
  {
    session: "Breakout Session 2",
    name: "Annie Perez-Gallardo",
    role: "UP Cebu Professor, ABS-CBN Regional Correspondent",
    topic: "The Storyteller's Toolkit: Writing & Interviewing",
    extra: "",
    imgUrl: "/speakers/annie-perez.jpg",
  },
  {
    session: "Breakout Session 3",
    name: "Aubry Lerio",
    role: "Founder, aFilm PH",
    topic: "Stories That Move: The Art of Video Storytelling",
    extra: "",
    imgUrl: "/speakers/aubry-lerio.jpg",
    speakerDescriptions: [
      {
        title: "Recognitions and Awards",
        descriptions: [
          'Director, "Rosaryo" - Best Short Film, Cebu Archdiocesan Mass Media Awards',
          'DDirector of Photography, "Bad Elements" &ndash; Best Picture and Best Cinematography, Oroquita Film Festival',
          "Director of Photography of “Bad Elements” &ndash; Top 5 Finalist, FNF Philippines",
          "Director, “Eyeglasses” - Finalist, Sinulog Short Film Festival",
          "Director, “Before Crossing” - Finalist, Sinulog Short Film Festival",
          "Director, “9 Days” - Finalist, Sinulog Short Film Festival",
          "Director, Michael&apos;s Eyes &ndash; International Film Trailer",
        ],
      },
    ],
  },
  {
    session: "Breakout Session 4",
    name: "Miko Mel C. Peñaloza",
    role: "Actor, ABS-CBN Segment Assistant Director, Diocese of San Pablo",
    topic: "BTS: The Production Process",
    extra: "",
    imgUrl: "/speakers/miko-penaloza.jpg",
  },
  {
    session: "Breakout Session 5",
    name: "April Frances Ortigas",
    role: "Web / UX Designer, Figma Specialist, Layout Artist, Digital Media Manager",
    topic: "Visualizing Ideas: The Art of Graphics and Layouting",
    extra: "",
    imgUrl: "/speakers/april-ortigas.jpg",
    speakerDescriptions: [
      {
        title: "Background",
        descriptions: [
          "Fondly called “Sky”, she is a Filipino UX/UI designer, Catholic communicator, and creative entrepreneur with over a decade of experience at the intersection of faith and digital media.",
          "A computer engineering graduate, she serves as online media manager, UX/UI designer, and layout artist for the Media Office of the Catholic Bishops' Conference of the Philippines and Areopagus Communications, Inc., where she handles all things design, from digital platforms to print publications.",
          "Alongside her work with the CBCP, she runs an active freelance and consulting practice, designing websites, brand identities, and digital experiences for clients across industries.",
          "Sky has dedicated much of her career to the Catholic digital mission. She serves as Vice President of YouthPinoy, a Catholic community that forms and mobilizes young online missionaries to evangelize through digital media.",
          "Her work in the Catholic space extends beyond design, encompassing content strategy, digital communications, and helping the Church speak clearly and compellingly in online spaces. She previously served as a missionary for Couples for Christ in Kenya and Tanzania, and held a role in the CFC Global Communications Office, giving her both a grassroots and institutional understanding of Catholic mission work.",
          "Her work consistently sits at the crossroads of design, craft, storytelling, and mission.",
        ],
      },
    ],
  },
  {
    session: "Breakout Session 6",
    name: "Kia Abrera",
    role: "Founder of Brave Creators Lab, Co-founder of Braveworks Inc.",
    topic: "Think Before You Create: Cognitive Strategies for Engaging Content",
    extra: "",
    imgUrl: "/speakers/kia-abrera.jpg",
    speakerDescriptions: [
      {
        title: "Education",
        descriptions: [
          "Certificate in Entrepreneurship (3 months), Singapore Polytechnic, 2019",
          "Innovative and Creative Enterprise (3 months), Thames International, 2019",
          "Bachelor of Arts in Film and Audio Visual Communication, University of the Philippines - Diliman, 2010",
          "High School, Colegio de las Hijas de Jesus, 2006",
        ],
      },
      {
        title: "Background",
        descriptions: [
          "Kia Abrera is a cognitive strategist working at the intersection of human behavior, neuroplasticity, communication, and strategy. She helps individuals, teams, and organizations think more clearly, decide more accurately, and communicate more effectively in high-pressure, high-noise environments.",
          "She is the co-founder and CEO of Braveworks Inc., a marketing and strategy consultancy she built with her husband. Over the past 11 years, her work has contributed to more than $500M in client results, supporting clients from micro-entrepreneurs to global organizations. Her experience spans brand strategy, behavioral marketing, leadership communication, and decision-making clarity—always grounded in how people actually think and behave, not how we assume they should.",
          "In 2023, Kia launched The Brave Creators Lab, an education ecosystem designed to help creative professionals learn the business of creativity, and to develop clarity, self-trust, and strategic thinking by understanding the mind behind their work. The Lab integrates principles from neuroplasticity, behavioral science, and communication psychology, with a strong emphasis on self-mastery as a prerequisite for sustainable growth.",
          "Kia is also a leading educreator on TikTok, where her work on thinking patterns, creativity, and human behavior has reached over 200,000 followers.",
          "She was shortlisted in the Top 17 for Best Education Creator at the TikTok Awards and was included in the Best of TikTok 2023 list.",
          "In October 2024, Kia earned a global certification in applied neuroscience, receiving her Professional Neuroplastician credential. This formal training deepened her long-standing practice of integrating neuromarketing, consumer neuroscience, and behavior change into strategy, communication, and personal development work. Today, she applies neuroplasticity principles not only in marketing, but also in leadership clarity, team dynamics, and individual growth.",
          "Her work and insights have been featured across major media platforms, including ANC Business Roadshow, CNN Philippines, Rappler, Adobo Magazine, GMA Lifestyle, and When In Manila.",
          "Kia has worked with a wide range of organizations, including USAID, The Futur, Coca-Cola, Shell, and Toyota, among others. She is also a professor at Meridian International College, where she teaches Psychology of Marketing and Market Research & Consumer Behavior.",
          "At the core of Kia&apos;s work is a simple conviction: clarity precedes performance. She continues her mission of helping people protect their thinking, rebuild trust in their minds, and use understanding—not pressure—as the foundation for meaningful growth."
        ],
      },
    ],
  },
];
