import Pictogram from "@/components/organism/pictogram";
import Separator from "@/components/atoms/separetor";

export default function SeparatorWithLogo() {
  return (
    <div className="relative flex items-center justify-center mt-5 mb-5 pt-5 pb-5">
      <Separator className="w-full" />
      <div className="absolute left-1/2 transform -translate-x-1/2 bg-primary px-4">
        <Pictogram />
      </div>
    </div>
  );
}
