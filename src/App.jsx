import React from 'react';
import { useWorkoutData } from './hooks/useWorkoutData';
import WeeklyGrid from './components/WeeklyGrid';
import WeekSelector from './components/WeekSelector';

function App() {
  const { data, activeWeek, actions } = useWorkoutData();

  const handleExport = () => {
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'progressio_v2_backup.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.weeks) {
          actions.importData(parsed);
          alert("Yedek başarıyla yüklendi!");
        } else {
          alert("Eski versiyon veya geçersiz dosya. Bu versiyonda sadece v2 yedekleri çalışır.");
        }
      } catch (err) {
        alert("Dosya okunamadı. Geçersiz JSON formatı.");
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Progressio Tracker <span className="text-sm font-normal text-gray-500 ml-2">v2.1</span></h1>
          <div className="flex gap-2 text-sm">
            <button onClick={actions.resetAll} className="text-red-600 hover:text-red-800 px-2 py-1">Sıfırla</button>
            <span className="text-gray-300">|</span>
            <button onClick={handleExport} className="text-gray-600 hover:text-gray-800 px-2 py-1">Yedek İndir</button>
            <label className="text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer">
              Yedek Yükle
              <input type="file" onChange={handleImport} className="hidden" accept=".json" />
            </label>
          </div>
        </div>

        {/* Week Selector */}
        <WeekSelector
          weeks={data.weeks}
          activeWeekId={data.activeWeekId}
          onSelectWeek={actions.setActiveWeek}
          onAddWeek={actions.addWeek}
          onDeleteWeek={actions.deleteWeek}
        />

        {/* Main Grid */}
        <WeeklyGrid
          activeWeek={activeWeek}
          onCellChange={actions.updateGridData}
          onAddExercise={actions.updateExercises}
          onUpdateExercises={actions.updateExercises}
          onUpdateRowColor={actions.updateRowColor}
          onUpdateDay={actions.updateDay}
          onClearData={() => { /* Handled per week if needed, or globally */ }}
        />
      </div>
    </div>
  );
}

export default App;
