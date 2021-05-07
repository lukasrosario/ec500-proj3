import { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import socketIOClient from 'socket.io-client';

function App() {
  const [tasks, setTasks] = useState([]);

  const socket = useRef(null);

  useEffect(() => {
    socket.current = socketIOClient();
    socket.current.on('timer', (data) => {
      setTasks((tasks) => [
        ...tasks
          .map(({ timer, tid }) =>
            data.tid === tid
              ? { timer: data.timer, tid: tid }
              : { timer: timer, tid: tid }
          )
          .filter((task) => task.timer > 0),
        ...(tasks.some((t) => t.tid === data.tid) ? [] : [data])
      ]);
    });
    return () => {
      socket.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {}, [tasks]);

  function startTask() {
    socket.current.emit('task');
  }

  return (
    <div className="w-full flex flex-col min-h-screen px-32 bg-gray-800 justify-center items-center">
      <button
        className="bg-indigo-600 py-2 px-4 rounded-md text-xl text-white mb-8"
        onClick={startTask}
      >
        Start tasks
      </button>
      <div className="w-1/2 flex flex-col h-96 overflow-y-auto border-2 border-white rounded-md">
        <div className="w-full flex flex-row justify-between px-16 py-2 border-b-2 border-white">
          <span className="text-lg text-white">Task id</span>
          <span className="text-lg text-white">Time left</span>
        </div>
        {tasks.map((task) => (
          <div
            key={task.tid}
            className="w-full flex flex-row justify-between px-16 py-2"
          >
            <span className="text-lg text-white">{task.tid}</span>
            <span className="text-lg text-white">{task.timer}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
