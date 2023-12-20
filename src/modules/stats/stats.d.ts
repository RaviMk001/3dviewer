declare module 'stats.js' 
{
    interface IStats 
    {
      REVISION: number;
      dom: HTMLElement;
      showPanel(value: number): void;
      begin(): void;
      end(): number;
      update(): void;
    }
  
    class Stats implements IStats 
    {
      REVISION: number;
      dom: HTMLElement;
  
      constructor();
  
      showPanel(value: number): void;
      begin(): void;
      end(): number;
      update(): void;
    }
  
    export = Stats;
  }