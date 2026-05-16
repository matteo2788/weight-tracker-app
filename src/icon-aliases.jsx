// icon-aliases.jsx — defensive aliases for common icon names
// Prevents page crashes when an override asks for a common icon name that the base icon set does not define.

(function addWeightLensIconAliases(){
  if (!window.I) return;

  const aliases = {
    Alert: 'Info',
    AlertCircle: 'Info',
    Warning: 'Info',
    Calendar: 'Weekly',
    CalendarDays: 'Weekly',
    Upload: 'Import',
    FileUp: 'Import',
    FileDown: 'Download',
    ChevronRight: 'Right',
    Close: 'X',
    Pencil: 'Edit',
    Delete: 'Trash',
    Camera: 'Photo',
    Image: 'Photo',
    Target: 'Goal',
  };

  Object.entries(aliases).forEach(([alias, existing]) => {
    if (!window.I[alias] && window.I[existing]) {
      window.I[alias] = window.I[existing];
    }
  });
})();
