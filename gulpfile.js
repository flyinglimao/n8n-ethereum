const { src, dest } = require('gulp');

function buildIcons() {
  const nodeIcons = src('nodes/**/*.{png,svg}')
    .pipe(dest('dist/nodes'));

  const credentialIcons = src('credentials/**/*.{png,svg}')
    .pipe(dest('dist/credentials'));

  return Promise.all([nodeIcons, credentialIcons]);
}

exports['build:icons'] = buildIcons;
exports.default = buildIcons;
