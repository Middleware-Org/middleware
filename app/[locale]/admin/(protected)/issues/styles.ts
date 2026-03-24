import { cn } from "@/lib/utils/classes";

import { entityCrudStyles } from "../shared/entityCrudStyles";

const styles = {
  ...entityCrudStyles,
  checkbox: cn(
    "w-4 h-4 text-tertiary border-secondary",
    "focus:ring-2 focus:ring-tertiary transition-all duration-150",
  ),
  editorContainer: cn("flex gap-6"),
  metaPanel: cn("w-80 flex flex-col gap-4 h-full min-h-0"),
  metaCard: cn("bg-primary border border-secondary p-4"),
  metaCardTitle: cn("text-lg font-semibold mb-4"),
  imageUpload: cn(
    "border-2 border-dashed border-secondary p-4",
    "hover:border-tertiary transition-colors duration-150 cursor-pointer",
  ),
  imagePreview: cn("mt-4 overflow-hidden border border-secondary"),
  imagePreviewImg: cn("w-full h-48 object-cover"),
};

export default styles;
