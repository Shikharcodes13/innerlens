// One entry per day of the 21-day WhatsApp video drip.
// url/caption are placeholders — replace with real hosted video URLs and copy.
// contentSid/contentVariables stay null until an approved Twilio WhatsApp
// Content Template exists for that day (required in production once a send
// falls outside the 24h customer-service window); until then the freeform
// body+mediaUrl path in whatsappService.js is used instead.
module.exports = [
  { day: 1, url: 'https://example.com/videos/day01.mp4', caption: "Hi {{firstName}}, welcome to Day 1 of your InnerLens journey!", contentSid: null, contentVariables: null },
  { day: 2, url: 'https://example.com/videos/day02.mp4', caption: "Day 2, {{firstName}} — let's keep going.", contentSid: null, contentVariables: null },
  { day: 3, url: 'https://example.com/videos/day03.mp4', caption: "Day 3, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 4, url: 'https://example.com/videos/day04.mp4', caption: "Day 4, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 5, url: 'https://example.com/videos/day05.mp4', caption: "Day 5, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 6, url: 'https://example.com/videos/day06.mp4', caption: "Day 6, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 7, url: 'https://example.com/videos/day07.mp4', caption: "Day 7, {{firstName}} — one week in!", contentSid: null, contentVariables: null },
  { day: 8, url: 'https://example.com/videos/day08.mp4', caption: "Day 8, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 9, url: 'https://example.com/videos/day09.mp4', caption: "Day 9, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 10, url: 'https://example.com/videos/day10.mp4', caption: "Day 10, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 11, url: 'https://example.com/videos/day11.mp4', caption: "Day 11, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 12, url: 'https://example.com/videos/day12.mp4', caption: "Day 12, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 13, url: 'https://example.com/videos/day13.mp4', caption: "Day 13, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 14, url: 'https://example.com/videos/day14.mp4', caption: "Day 14, {{firstName}} — two weeks in!", contentSid: null, contentVariables: null },
  { day: 15, url: 'https://example.com/videos/day15.mp4', caption: "Day 15, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 16, url: 'https://example.com/videos/day16.mp4', caption: "Day 16, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 17, url: 'https://example.com/videos/day17.mp4', caption: "Day 17, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 18, url: 'https://example.com/videos/day18.mp4', caption: "Day 18, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 19, url: 'https://example.com/videos/day19.mp4', caption: "Day 19, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 20, url: 'https://example.com/videos/day20.mp4', caption: "Day 20, {{firstName}}.", contentSid: null, contentVariables: null },
  { day: 21, url: 'https://example.com/videos/day21.mp4', caption: "Day 21, {{firstName}} — you made it to the end. Congratulations!", contentSid: null, contentVariables: null },
];
