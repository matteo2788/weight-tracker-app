// error-boundary.jsx — protects WeightLens from broken page-level renders

class WeightLensErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error){
    return {
      hasError: true,
      errorMessage: error && error.message ? error.message : 'Something went wrong.'
    };
  }

  componentDidCatch(error, info){
    console.error('WeightLens page crashed:', error, info);
  }

  goDashboard(){
    try {
      window.location.hash = 'dashboard';
      window.location.reload();
    } catch(e) {
      window.location.href = window.location.origin + window.location.pathname + '#dashboard';
    }
  }

  render(){
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-5">
        <Card className="max-w-2xl w-full mx-auto text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-warn/10 text-warn flex items-center justify-center mb-4">
            <I.Info className="h-5 w-5"/>
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-2">Page recovery</div>
          <h2 className="text-2xl font-semibold tracking-tight">WeightLens caught a temporary error.</h2>
          <p className="text-mute mt-3 leading-relaxed">
            Your data is still safe. This usually means one tab hit a code issue. Try again, or jump back to the dashboard.
          </p>
          {this.state.errorMessage && (
            <div className="mt-4 rounded-2xl bg-surface3 border border-line2 p-3 text-left text-[12px] text-mute font-mono overflow-auto max-h-36">
              {this.state.errorMessage}
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => this.setState({ hasError: false, errorMessage: '' })}>Try again</Button>
            <Button variant="secondary" onClick={() => this.goDashboard()}>Go to dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }
}

window.WeightLensErrorBoundary = WeightLensErrorBoundary;

(function activateWeightLensErrorBoundary(){
  if (!window.ReactDOM || !window.React || window.__weightLensErrorBoundaryActive) return;
  window.__weightLensErrorBoundaryActive = true;

  const originalCreateRoot = window.ReactDOM.createRoot;
  if (!originalCreateRoot) return;

  window.ReactDOM.createRoot = function(container, options){
    const root = originalCreateRoot.call(window.ReactDOM, container, options);
    const originalRender = root.render.bind(root);

    root.render = function(element){
      return originalRender(
        <WeightLensErrorBoundary>
          {element}
        </WeightLensErrorBoundary>
      );
    };

    return root;
  };
})();
