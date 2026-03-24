import { cn } from "@/lib/utils/classes";

import { entityCrudStyles } from "../shared/entityCrudStyles";

const styles = {
  ...entityCrudStyles,
  submitButton: cn(entityCrudStyles.submitButton, "flex items-center gap-2"),
};

export default styles;
