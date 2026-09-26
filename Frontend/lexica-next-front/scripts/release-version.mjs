export function getAppVersion(releaseTag, requireReleaseTag = 'false') {
  if (requireReleaseTag !== 'true' && requireReleaseTag !== 'false') {
    throw new Error('LEXICA_REQUIRE_RELEASE_TAG must be true or false.');
  }

  if (!releaseTag) {
    if (requireReleaseTag === 'true') {
      throw new Error('LEXICA_RELEASE_TAG is required for a published release.');
    }

    return 'Development';
  }

  validateReleaseTag(releaseTag);

  return `${releaseTag.slice(0, 4)}.${releaseTag.slice(4, 6)}.${releaseTag.slice(6)}`;
}

function validateReleaseTag(releaseTag) {
  const parts = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/.exec(releaseTag);
  if (!parts || releaseTag.length !== 15) {
    throwInvalidReleaseTag();
  }

  const [year, month, day, hour, minute, second] = parts.slice(1).map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1] ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throwInvalidReleaseTag();
  }
}

function throwInvalidReleaseTag() {
  throw new Error('LEXICA_RELEASE_TAG must be a valid YYYYMMDD-HHmmss date and time.');
}
