from enum import Enum

class Provider(Enum):
    GIT = "git"

    @classmethod
    def from_str(cls, value: str):
        try:
            return cls(value.lower())
        except ValueError:
            valid = [e.value for e in cls]
            raise ValueError(f"Invalid provider '{value}'. Expected one of {valid}")