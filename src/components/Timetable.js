import React, { useState, useEffect } from 'react';

const Timetable = () => {
  const [timetable, setTimetable] = useState(() => {
    try {
      const savedTimetable = localStorage.getItem('timetable');
      return savedTimetable ? JSON.parse(savedTimetable) : Array(14).fill(null).map(() => Array(7).fill(''));
    } catch (error) {
      console.error("Failed to parse timetable from localStorage", error);
      return Array(14).fill(null).map(() => Array(7).fill(''));
    }
  });
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, colIndex }
  const [cellValue, setCellValue] = useState('');

  useEffect(() => {
    localStorage.setItem('timetable', JSON.stringify(timetable));
  }, [timetable]);

  const handleCellClick = (rowIndex, colIndex) => {
    setEditingCell({ rowIndex, colIndex });
    setCellValue(timetable[rowIndex][colIndex]);
  };

  const handleCellChange = (e) => {
    setCellValue(e.target.value);
  };

  const saveAndExitEditing = () => {
    if (!editingCell) return;

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
      saveAndExitEditing();
    }
  };

  const hours = Array.from({ length: 14 }, (_, i) => `${9 + i}:00`);
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="timetable-container">
      <h3>시간표</h3>
      <p className="timetable-guide">수정하고 싶은 칸을 클릭하여 내용을 입력하세요. 엔터를 누르거나 다른 곳을 클릭하면 저장됩니다.</p>
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
                <td key={colIndex} onClick={() => handleCellClick(rowIndex, colIndex)}>
                  {editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex ? (
                    <input
                      type="text"
                      value={cellValue}
                      onChange={handleCellChange}
                      onBlur={saveAndExitEditing}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      className="timetable-input"
                    />
                  ) : (
                    <div className="timetable-cell-content">{timetable[rowIndex][colIndex] || '-'}</div>
                  )}
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