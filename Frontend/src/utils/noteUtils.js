
export const addNoteToArray = (notes, newNote) => [...notes, newNote];
export const deleteNoteFromArray = (notes, id) =>
  notes.filter((noteItem, index) => index !== id);
