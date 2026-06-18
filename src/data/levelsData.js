export const campaignDecisions = [
  {
    week: 1,
    title: 'שבוע 1: פתיחת הקמפיין',
    situation: 'הבחירות הוכרזו. אתה עומד להשיק את הקמפיין הרשמי שלך.',
    options: [
      { id: 'social_blitz', emoji: '📱', title: 'קמפיין ברשתות', desc: 'כבוש את הרשתות החברתיות לפני כולם', effects: { mandates: 2, leverage: 1 }, outcome: 'הסרטונים מתפשטים! עלייה משמעותית בסקרים.' },
      { id: 'mass_rally', emoji: '🏟️', title: 'עצרת המונים', desc: 'עצרת ענק לחיזוק הבסיס האידיאולוגי', effects: { mandates: 3, leverage: 0 }, outcome: 'עשרות אלפים בכיכר. הבסיס חם ונלהב.' },
      { id: 'early_coalition', emoji: '🤝', title: 'גישוש קואליציוני', desc: 'פגישות חשאיות עם מנהיגים פוטנציאליים', effects: { mandates: 0, leverage: 5 }, outcome: 'קשרים נוצרו מוקדם. כוח המינוף שלך גדל.' }
    ]
  },
  {
    week: 2,
    title: 'שבוע 2: גיחות המתחרים',
    situation: 'המתחרים מתחזקים. המדיה מכסה את כולם. הסקרים מתנודדים.',
    options: [
      { id: 'attack_ad', emoji: '⚔️', title: 'קמפיין שלילי', desc: 'תקיפה ישירה על המתחרה הגדול ביותר', effects: { mandates: 2, leverage: -1, attackRival: true }, outcome: 'הוויכוח מתחמם. שניכם בכותרות — אבל לא כולם אוהבים את זה.' },
      { id: 'policy_details', emoji: '📋', title: 'פרוגרמה מפורטת', desc: 'פרסם תכנית עבודה מפורטת לממשלה', effects: { mandates: 2, leverage: 2 }, outcome: 'העיתונות מסקרת ברצינות. מצביעים מתלבטים מתרשמים.' },
      { id: 'endorsement_hunt', emoji: '⭐', title: 'גיוס תמיכה ציבורית', desc: 'גייס המלצות מאנשי ציבור ידועים', effects: { mandates: 3, leverage: 1 }, outcome: 'ידוענים ומנהיגי דעה מכריזים על תמיכה. מומנטום!' }
    ]
  },
  {
    week: 3,
    title: 'שבוע 3: השבוע האחרון',
    situation: 'שבוע אחרון לפני הבחירות. כל קול עשוי להכריע.',
    options: [
      { id: 'gotv', emoji: '🏘️', title: 'הוצאת מצביעים', desc: 'מאות פעילים בשטח — להוציא כל מצביע', effects: { mandates: 2, leverage: 1 }, outcome: 'שיעור ההצבעה גבוה באזורי החוזק שלך.' },
      { id: 'undecided_focus', emoji: '🎯', title: 'ציד מתלבטים', desc: 'קמפיין ממוקד לחצי המיליון המתלבטים', effects: { mandates: 4, leverage: 0 }, outcome: 'זינוק אחרון בסקרים. המתלבטים בוחרים בך!' },
      { id: 'alliance_signal', emoji: '🚀', title: 'איתות קואליציוני', desc: 'הכרז על שותפויות קואליציוניות מוקדמות', effects: { mandates: 1, leverage: 4 }, outcome: 'מפלגות קטנות מבינות שאתה שחקן כוח. כוחך גדל.' }
    ]
  }
];

export const debateQuestions = [
  {
    id: 'economy', topic: 'כלכלה', emoji: '💰',
    question: 'מה הפתרון שלך ליוקר המחיה ולמשבר הדיור?',
    context: 'ישראלים רבים מתקשים להגיע לסוף החודש. המנחה דורש תשובות.',
    answers: [
      { id: 'free_market', label: 'שוק חופשי וביטול רגולציה', emoji: '📈', effects: { mandates: 2, leverage: 0 }, reaction: 'המגזר הפרטי מתלהב. המעמד הבינוני פחות.' },
      { id: 'social_housing', label: 'דיור ציבורי ותמיכה חברתית', emoji: '🏠', effects: { mandates: 3, leverage: 1 }, reaction: 'המחאה החברתית מריעה. הסקרים קופצים.' },
      { id: 'business_incentives', label: 'עידוד עסקים קטנים ובינוניים', emoji: '🏪', effects: { mandates: 2, leverage: 2 }, reaction: 'תשובה מאוזנת שמושכת מכל הצדדים.' }
    ]
  },
  {
    id: 'security', topic: 'ביטחון', emoji: '🛡️',
    question: 'איך תתמודד עם האיומים הביטחוניים על ישראל?',
    context: 'מצב ביטחוני מתוח. המנחה שואל על עמדתך.',
    answers: [
      { id: 'hard_power', label: 'כוח מבוסס ולא נסיגות', emoji: '💪', effects: { mandates: 3, leverage: -1 }, reaction: 'הגוש הימני מריע. השמאל מבקר.' },
      { id: 'diplomacy', label: 'דיפלומטיה נמרצת ושיתוף פעולה', emoji: '🕊️', effects: { mandates: 2, leverage: 2 }, reaction: 'שבחים מהקהילה הבינלאומית. מושך מצביעים מרכז.' },
      { id: 'deterrence', label: 'הרתעה חכמה — כוח ומשא ומתן', emoji: '⚖️', effects: { mandates: 2, leverage: 1 }, reaction: 'תשובה מקצועית. מקבל ציונים גבוהים בסקרים.' }
    ]
  },
  {
    id: 'judiciary', topic: 'דמוקרטיה ומשפט', emoji: '⚖️',
    question: 'מה עמדתך על הרפורמה המשפטית?',
    context: 'המחאה ממשיכה. השאלה מפצלת את הציבור.',
    answers: [
      { id: 'pro_reform', label: 'תמיכה ברפורמה לאיזון הרשויות', emoji: '🔧', effects: { mandates: 2, leverage: -1 }, reaction: 'הגוש הימני שמח. הגוש המרכז-שמאל זועם.' },
      { id: 'anti_reform', label: 'התנגדות מוחלטת לרפורמה', emoji: '🚫', effects: { mandates: 2, leverage: 0 }, reaction: 'המחאה מרימה כוס. הימין מעצבן.' },
      { id: 'compromise', label: 'דיאלוג לאומי ופשרה', emoji: '🤝', effects: { mandates: 1, leverage: 4 }, reaction: 'נשמע כמו מנהיג. כוח מינוף אדיר נוצר.' }
    ]
  },
  {
    id: 'coalitions', topic: 'קואליציה', emoji: '🏛️',
    question: 'עם מי תוכל לשבת בממשלה?',
    context: 'שאלת הקואליציה הכי חשובה לפני הבחירות.',
    answers: [
      { id: 'narrow', label: 'רק עם גוש אמוני ואידיאולוגי', emoji: '🎯', effects: { mandates: 2, leverage: -2 }, reaction: 'הבסיס אוהב. אבל אפשרויות הקואליציה מצטמצמות.' },
      { id: 'broad', label: 'קואליציה רחבה — גם עם מתנגדים', emoji: '🌐', effects: { mandates: 1, leverage: 5 }, reaction: 'פרגמטיסט! כוחך לבנות קואליציות גדל מאוד.' },
      { id: 'selective', label: 'פתוח לכל — תלוי בתנאים', emoji: '🤔', effects: { mandates: 2, leverage: 2 }, reaction: 'גמיש וחכם. אפשרויות נשארות פתוחות.' }
    ]
  }
];
