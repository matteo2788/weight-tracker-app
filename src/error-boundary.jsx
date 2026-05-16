// error-boundary.jsx — protects the app from broken page-level renders

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

  componentDidUpdate(prevProps){
    if (prevProps.route !== this.props.route && this.state.hasError) {
      this.setState({ hasError: false, errorMessage: '' });
    }
  }

  render(){
    if (!this.state.hasError) return this.props.children;

    return (
      <Card className="max-w-2xl mx-auto my-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-warn/10 text-warn flex items-center justify-center mb-4">
          <I.Info className="h-5 w-5"/>
        </div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-2">Page recovery</div>
        <h2 className="text-2xl font-semibold tracking-tight">This tab hit a temporary error.</h2>
        <p className="text-mute mt-3 leading-relaxed">
          The rest of WeightLens is still safe. Try opening another tab, then come back. If this keeps happening, the page needs a small code fix.
        </p>
        {this.state.errorMessage && (
          <div className="mt-4 rounded-2xl bg-surface3 border border-line2 p-3 text-left text-[12px] text-mute font-mono overflow-auto">
            {this.state.errorMessage}
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={() => this.setState({ hasError: false, errorMessage: '' })}>Try again</Button>
          {this.props.setRoute && <Button variant="secondary" onClick={() => this.props.setRoute('dashboard')}>Go to dashboard</Button>}
        </div>
      </Card>
    );
  }
}

window.WeightLensErrorBoundary = WeightLensErrorBoundary;
