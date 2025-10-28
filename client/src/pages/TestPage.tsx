export default function TestPage() {
  console.log('🧪 TestPage renderizada!');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'blue',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      zIndex: 9999
    }}>
      TEST PAGE FUNCIONANDO!
    </div>
  );
}