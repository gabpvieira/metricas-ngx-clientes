import NewClientDialog from '../NewClientDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function NewClientDialogExample() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: any) => {
    console.log('New client data:', data);
  };

  return (
    <div className="p-6 bg-background">
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <NewClientDialog open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </div>
  );
}
