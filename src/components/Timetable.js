import React, { useState, useEffect } from 'react';

const Timetable = () => {
  const [timetable, setTimetable] = useState(() => {
    const savedTimetable = localStorage.getItem('timetable');
    return savedTimetable ? JSON.parse(savedTimetable) : Array(14).fill(null).map(() => Array(7).fill(''));
  });
  const [editingCell, setEditingCell] = useState(null);
  const [cellValue, setCellValue] = useState('');

  useEffect(() => {
    localStorage.setItem('timetable', JSON.stringify(timetable));
  }, [timetable]);

  const handleCellClick = (rowIndex, colIndex, value) => {
    setEditingCell({ rowIndex, colIndex });
    setCellValue(value);
  };

  const handleCellChange = (e) => {
    setCellValue(e.target.value);
  };

  const handleCellBlur = () => {
    const newTimetable = timetable.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === editingCell.rowIndex && cIdx === editingCell.colIndex ? cellValue : cell
      )
    );
    setTimetable(newTimetable);
    setEditingCell(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    }
  };

  const renderCell = (value, rowIndex, colIndex) => {
    if (editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex) {
      return (
        <input
          type="text"
          value={cellValue}
          onChange={handleCellChange}
          onBlur={handleCellBlur}
          onKeyPress={handleKeyPress}
          autoFocus
        />
      );
    }
    return <div onClick={() => handleCellClick(rowIndex, colIndex, value)}>{value}</div>;
  };

  const hours = Array.from({ length: 14 }, (_, i) => `${9 + i}:00`);
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="timetable-container">
      <h3>시간표</h3>
      <table>
        <thead>
          <tr>
            <th>시간</th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour, rowIndex) => (
            <tr key={hour}>
              <td>{hour}</td>
              {days.map((_, colIndex) => (
                <td key={colIndex}>
                  {renderCell(timetable[rowIndex][colIndex], rowIndex, colIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Timetable;