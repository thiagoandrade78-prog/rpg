import React,{Component,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Index from './pages/_index';
class Boundary extends Component<{children:React.ReactNode},{error:string}> {
 state={error:''};static getDerivedStateFromError(e:unknown){return {error:e instanceof Error?e.message:String(e)};}
 render(){if(this.state.error)return <section style={{maxWidth:700,margin:'10vh auto',padding:32,background:'#ead3a4',color:'#352218',border:'3px solid #8a5e36'}}><h1>Não foi possível abrir a arena</h1><p>O seu salvamento não foi apagado. Reabra este arquivo em Chrome ou Edge e mantenha o JavaScript habilitado.</p><pre style={{whiteSpace:'pre-wrap'}}>{this.state.error}</pre><button onClick={()=>location.reload()}>Tentar novamente</button></section>;return this.props.children;}
}
function Ready(){useEffect(()=>{document.getElementById('boot')?.remove();document.documentElement.dataset.arenaReady='true';},[]);return <Index/>;}
const target=document.getElementById('root');if(!target)throw new Error('Contêiner de inicialização ausente.');createRoot(target).render(<Boundary><Ready/></Boundary>);
