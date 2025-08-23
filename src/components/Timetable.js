import React, { useState, useEffect, useRef } from 'react';

const Timetable = () => {
  const [schedule, setSchedule] = useState(() => {
    try {
      const savedSchedule = localStorage.getItem('timetable_schedule');
      return savedSchedule ? JSON.parse(savedSchedule) : {};
    } catch (error) {
      return {};
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockTitle, setBlockTitle] = useState('');
  const timetableRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('timetable_schedule', JSON.stringify(schedule));
  }, [schedule]);

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const hours = Array.from({ length: 20 }, (_, i) => i + 5); // 5 AM to 12 AM (24h)

  const getCellInfo = (e) => {
    const rect = timetableRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = (rect.width - 60) / 7; // 60 is time column width
    const cellHeight = rect.height / (hours.length * 6); // 6 slots per hour

    const dayIndex = Math.floor(x / cellWidth);
    const timeIndex = Math.floor(y / cellHeight);

    if (dayIndex < 0 || dayIndex >= 7) return null;

    return { day: days[dayIndex], timeIndex };
  };

  const handleMouseDown = (e) => {
    const info = getCellInfo(e);
    if (info) {
      setIsDragging(true);
      setDragStart(info);
      setDragCurrent(info);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const info = getCellInfo(e);
      if (info && info.day === dragStart.day) {
        setDragCurrent(info);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragCurrent) {
      const startTimeIndex = Math.min(dragStart.timeIndex, dragCurrent.timeIndex);
      const endTimeIndex = Math.max(dragStart.timeIndex, dragCurrent.timeIndex);

      if (startTimeIndex !== endTimeIndex) {
        const newBlock = {
          id: Date.now(),
          day: dragStart.day,
          start: startTimeIndex,
          end: endTimeIndex + 1,
          title: '새 일정'
        };
        setSchedule(prev => ({
          ...prev,
          [newBlock.id]: newBlock
        }));
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleBlockClick = (block) => {
    setEditingBlock(block);
    setBlockTitle(block.title);
  };

  const handleSaveTitle = () => {
    if (editingBlock) {
      setSchedule(prev => ({
        ...prev,
        [editingBlock.id]: { ...editingBlock, title: blockTitle }
      }));
    }
    setEditingBlock(null);
    setBlockTitle('');
  };

  const handleDeleteBlock = () => {
      if (editingBlock && window.confirm(`'${editingBlock.title}' 일정을 삭제하시겠습니까?`)) {
          setSchedule(prev => {
              const newSchedule = { ...prev };
              delete newSchedule[editingBlock.id];
              return newSchedule;
          });
      }
      setEditingBlock(null);
      setBlockTitle('');
  }

  const renderBlocks = () => {
    return Object.values(schedule).map(block => {
      const top = (block.start / (hours.length * 6)) * 100;
      const height = ((block.end - block.start) / (hours.length * 6)) * 100;
      const left = (days.indexOf(block.day) / 7) * 100;
      const width = 100 / 7;

      return (
        <div
          key={block.id}
          className="schedule-block"
          style={{
            top: `${top}%`,
            height: `${height}%`,
            left: `${left}%`,
            width: `${width}%`
          }}
          onClick={() => handleBlockClick(block)}
        >
          {block.title}
        </div>
      );
    });
  };

  const renderDragPreview = () => {
      if (!isDragging || !dragStart || !dragCurrent) return null;

      const startIdx = Math.min(dragStart.timeIndex, dragCurrent.timeIndex);
      const endIdx = Math.max(dragStart.timeIndex, dragCurrent.timeIndex);

      const top = (startIdx / (hours.length * 6)) * 100;
      const height = ((endIdx - startIdx + 1) / (hours.length * 6)) * 100;
      const left = (days.indexOf(dragStart.day) / 7) * 100;
      const width = 100 / 7;

       return (
        <div
          className="drag-preview"
          style={{ top: `${top}%`, height: `${height}%`, left: `${left}%`, width: `${width}%` }}
        />
      );
  }

  return (
    <>
      <div className="timetable-container-dnd">
        <h3>시간표</h3>
        <p className="timetable-guide">빈 공간을 드래그하여 새 일정을 추가하세요. 생성된 일정은 클릭하여 수정/삭제할 수 있습니다.</p>
        <div className="timetable-grid">
          <div className="time-column">
            {hours.map(hour => (
              <div key={hour} className="time-label">{`${hour}:00`}</div>
            ))}
          </div>
          <div
            className="schedule-area"
            ref={timetableRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {days.map(day => (
              <div key={day} className="day-column">
                {Array.from({ length: hours.length * 6 }).map((_, i) => (
                  <div key={i} className="time-slot" />
                ))}
              </div>
            ))}
            {renderBlocks()}
            {renderDragPreview()}
          </div>
        </div>
        <div className="day-header">
            {days.map(day => <div key={day}>{day}</div>)}
        </div>
      </div>

      {editingBlock && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h4>일정 수정</h4>
                <input
                    type="text"
                    value={blockTitle}
                    onChange={(e) => setBlockTitle(e.target.value)}
                    autoFocus
                />
                <div className="modal-actions">
                    <button onClick={handleSaveTitle}>저장</button>
                    <button className="delete" onClick={handleDeleteBlock}>삭제</button>
                    <button className="cancel" onClick={() => setEditingBlock(null)}>취소</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Timetable;