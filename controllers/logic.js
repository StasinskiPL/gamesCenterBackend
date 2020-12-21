exports.connectFourGravitation = (grid, cellId, color) => {
  const chceckDown = (_id) => {
    if (!grid[_id + 7] || grid[_id + 7].taken) {
      return _id;
    } else {
      return chceckDown(_id + 7);
    }
  };

  return chceckDown(cellId);
};
