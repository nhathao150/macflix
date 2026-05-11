const fs = require('fs');
const path = require('path');

const moves = [
  ['app/dang-nhap', 'app/(auth)/dang-nhap'],
  ['app/quen-mat-khau', 'app/(auth)/quen-mat-khau'],
  ['app/dat-lai-mat-khau', 'app/(auth)/dat-lai-mat-khau'],
  ['app/xac-thuc-email', 'app/(auth)/xac-thuc-email'],
  ['app/ca-nhan', 'app/(user)/ca-nhan'],
  ['app/lich-su', 'app/(user)/lich-su'],
  ['app/yeu-thich', 'app/(user)/yeu-thich'],
  ['components/Navbar.tsx', 'components/layout/Navbar.tsx'],
  ['components/Footer.tsx', 'components/layout/Footer.tsx'],
  ['components/MovieCard.tsx', 'components/movies/MovieCard.tsx'],
  ['components/MovieModal.tsx', 'components/movies/MovieModal.tsx'],
  ['components/MovieRow.tsx', 'components/movies/MovieRow.tsx'],
  ['components/CastCard.tsx', 'components/movies/CastCard.tsx'],
  ['components/Hero.tsx', 'components/home/Hero.tsx'],
  ['components/HomeContent.tsx', 'components/home/HomeContent.tsx'],
  ['components/FavoriteButton.tsx', 'components/ui/FavoriteButton.tsx'],
  ['components/WelcomeWrapper.tsx', 'components/ui/WelcomeWrapper.tsx'],
  ['components/WelcomeScreen.jsx', 'components/ui/WelcomeScreen.tsx']
];

['app/(auth)', 'app/(user)', 'components/layout', 'components/movies', 'components/home', 'components/ui'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

for (const [src, dest] of moves) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} to ${dest}`);
  }
}
